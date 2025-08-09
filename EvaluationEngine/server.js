// This is the entry point for Azure App Service
const express = require('express');
const cors = require('cors');

// Create a minimal express app that works even if there are issues with the main app
const app = express();
app.use(cors());

// Add a simple ping endpoint that doesn't depend on any configuration
app.get('/ping', (req, res) => {
  res.status(200).send('pong - from server.js');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running (from server.js)',
    timestamp: new Date().toISOString()
  });
});

// Try to load the main app
try {
  // Only try to start the TypeScript app if not in Azure (where we'll use the built version)
  if (process.env.NODE_ENV !== 'production') {
    console.log('Starting TypeScript app in development mode');
    require('ts-node/register');
    require('./src/app.ts');
  } else {
    console.log('Starting compiled JavaScript app in production mode');
    // In production, we'll use the compiled JavaScript
    require('./dist/app.js');
  }
} catch (err) {
  console.error('Failed to start main app:', err);
}

// Define a port for this minimal app to listen on
const PORT = process.env.PORT || 3000;

// Start listening
app.listen(PORT, () => {
  console.log(`Minimal server running on port ${PORT}`);
});
