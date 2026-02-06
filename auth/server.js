const { app, initAuth } = require('./app');

// Start Server
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Auth Service running on port ${PORT}`);
    initAuth();
});
