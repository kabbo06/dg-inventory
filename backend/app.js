const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { createClient } = require('redis');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Universal Redis Connection
const redisClient = createClient({
    url: `redis://:${process.env.REDIS_PASSWORD}@cache:6379`
});

// 2. MongoDB Product Schema
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, default: 0 },
    cost_price: { type: Number, default: 0 },
    retail_price: { type: Number, default: 0 },
    description: String
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

productSchema.virtual('total_price').get(function() {
    return (this.quantity * this.retail_price).toFixed(2);
});

const Product = mongoose.model('Product', productSchema);

// 3. Robust Startup Logic
async function initBackend() {
    try {
        await redisClient.connect();
        console.log("SUCCESS: Connected to Redis.");

        await mongoose.connect(process.env.MONGO_URI);
        console.log("SUCCESS: Connected to MongoDB.");

    } catch (err) {
        console.error("BACKEND INIT ERROR:", err.message);
        setTimeout(initBackend, 5000);
    }
}

// 4. Middleware: Fetches the shared dynamic secret from Redis
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "No token provided" });

    try {
        // Fetch the global secret shared by all Auth replicas
        const currentSecret = await redisClient.get('system_jwt_secret');

        if (!currentSecret) {
            return res.status(503).json({ error: "Security system initializing..." });
        }

        jwt.verify(token, currentSecret, (err, user) => {
            if (err) return res.status(403).json({ error: "Invalid or expired token" });
            req.user = user;
            next();
        });
    } catch (err) {
        console.error("Token verification error:", err.message);
        res.status(500).json({ error: "Internal Auth Error" });
    }
};

// --- PRODUCT ROUTES ---

// --- HEALTH CHECK (Placed BEFORE verifyToken) ---
// Reachable at: https://${SERVER_NAME}/api/products/health
app.get('/api/products/health', async (req, res) => {
    const mongoStatus = mongoose.connection.readyState === 1 ? 'up' : 'down';
    let redisStatus = 'down';
    
    try {
        // Checking if the shared secret exists in Redis as a health indicator
        const secretExists = await redisClient.get('system_jwt_secret');
        redisStatus = secretExists ? 'up' : 'initializing';
    } catch (e) {
        redisStatus = 'down';
    }

    const isLive = mongoStatus === 'up' && redisStatus === 'up';

    res.status(isLive ? 200 : 503).json({
        status: isLive ? 'live' : 'unhealthy',
        database: mongoStatus,
        cache: redisStatus
    });
});

app.get('/api/products', verifyToken, async (req, res) => {
    const { search } = req.query;
    try {
        let filter = {};
        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }
        const products = await Product.find(filter).sort({ _id: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/products', verifyToken, async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/products/:id', verifyToken, async (req, res) => {
    try {
        await Product.findByIdAndUpdate(req.params.id, req.body);
        res.send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/products/:id', verifyToken, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Export for Testing and Server Startup
module.exports = { app, initBackend, redisClient };