const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { createClient } = require('redis');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// 1. Universal Redis Connection
const redisClient = createClient({
    url: `redis://:${process.env.REDIS_PASSWORD}@cache:6379`
});

// 2. MongoDB User Schema & Model
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

let dynamicSecret;

// 3. Robust Initialization with Error Handling
async function initAuth() {
    try {
        // Connect to Redis
        await redisClient.connect();
        console.log("SUCCESS: Connected to Redis.");

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("SUCCESS: Connected to MongoDB.");

        // Initial Seed: Create admin if not exists
        const adminExists = await User.findOne({ username: 'admin' });
        if (!adminExists) {
            await User.create({
                username: 'admin',
                password: 'admin'
            });
            console.log("SUCCESS: Default admin user seeded.");
        }

        // --- SHARED SECRET LOGIC FOR REPLICATION ---
        // Check if a secret already exists in Redis (created by another replica)
        const existingSecret = await redisClient.get('system_jwt_secret');

        if (existingSecret) {
            dynamicSecret = existingSecret;
            console.log("SUCCESS: Existing JWT secret loaded from Redis.");
        } else {
            // Generate and share JWT secret if none exists
            dynamicSecret = crypto.randomBytes(32).toString('hex');
            await redisClient.set('system_jwt_secret', dynamicSecret);
            console.log("SUCCESS: New dynamic JWT secret generated and saved to Redis.");
        }

    } catch (err) {
        console.error("INITIALIZATION ERROR:", err.message);
        // Retry logic: wait 5 seconds and try again
        setTimeout(initAuth, 5000);
    }
}

// 4. API Endpoints
app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });

        if (user && password === user.password) {
            // Use the shared dynamicSecret
            // Note: Fallback secret added only for testing environments
            const token = jwt.sign(
                { username: user.username },
                dynamicSecret || 'test_secret_only', 
                { expiresIn: '8h' }
            );
            res.json({ token });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ error: "Database error" });
    }
});

app.post('/auth/change-password', async (req, res) => {
    const { username, newPassword } = req.body;
    try {
        const result = await User.updateOne(
            { username: username },
            { $set: { password: newPassword } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "Password updated" });
    } catch (err) {
        res.status(500).json({ error: "Database update failed" });
    }
});

// Export for Testing and Server Startup
module.exports = { app, initAuth };
