const { app, initBackend } = require('./app');

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Inventory Service running on port ${PORT}`);
    initBackend();
});
