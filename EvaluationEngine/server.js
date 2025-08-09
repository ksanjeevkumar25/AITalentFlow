// Standalone server.js for Azure App Service
// This file intentionally has no dependencies on other project files

console.log('Starting minimal server.js');

// Basic HTTP server using Node's built-in http module
const http = require('http');

const server = http.createServer((req, res) => {
  console.log(`Received request for ${req.url}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }
  
  // Handle different routes
  if (req.url === '/ping') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('pong - minimal server');
  } 
  else if (req.url === '/health') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Minimal server is running'
    }));
  }
  else if (req.url === '/env') {
    // Return environment info (excluding secrets)
    const safeEnv = {};
    for (const key in process.env) {
      // Skip environment variables that might contain secrets
      if (!key.includes('PASSWORD') && 
          !key.includes('SECRET') && 
          !key.includes('KEY')) {
        safeEnv[key] = process.env[key];
      } else {
        safeEnv[key] = '[REDACTED]';
      }
    }
    
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      env: safeEnv,
      nodeVersion: process.version,
      platform: process.platform
    }, null, 2));
  }
  else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Minimal Node.js server is running');
  }
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Minimal server listening on port ${port}`);
});
