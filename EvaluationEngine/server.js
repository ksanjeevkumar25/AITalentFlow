// Server.js entry point for Azure App Service
console.log('Starting server.js - Node version:', process.version);
console.log('Current directory:', process.cwd());
console.log('Directory contents:', require('fs').readdirSync('.'));

// Determine if we're running the TypeScript app or a fallback server
try {
  const fs = require('fs');
  
  // Check if compiled JavaScript files exist
  if (fs.existsSync('./dist/app.js')) {
    console.log('Found compiled TypeScript - loading dist/app.js');
    require('./dist/app.js');
  }
  // Check if we have TypeScript files but no compiled JS
  else if (fs.existsSync('./src/app.ts')) {
    try {
      console.log('Found TypeScript source - attempting to use ts-node');
      // Check if ts-node is available
      require.resolve('ts-node');
      require('ts-node/register');
      require('./src/app.ts');
    } catch (tsNodeError) {
      console.error('Error loading TypeScript with ts-node:', tsNodeError);
      throw new Error('Cannot run TypeScript without compilation or ts-node');
    }
  } else {
    throw new Error('Could not find app.js or app.ts');
  }
} catch (error) {
  // If there's an error loading the main app, start a minimal server
  console.error('Failed to start main application:', error);
  console.log('Starting fallback HTTP server');
  
  // Basic HTTP server as a fallback
  require('http').createServer(function(req, res) {
    // Log the request for debugging
    console.log(new Date().toISOString() + ' - Request: ' + req.url);

    // Enable CORS for all origins
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    
    // Handle OPTIONS requests (CORS preflight)
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Return different responses based on the path
    if (req.url === '/health' || req.url === '/ping') {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({
        status: 'warning',
        message: 'Main application failed to load, running in fallback mode',
        timestamp: new Date().toISOString()
      }));
    } else {
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end('Application error: The main server failed to start properly.');
    }
  }).listen(process.env.PORT || 8080, function() {
    console.log('Fallback server started on port ' + (process.env.PORT || 8080));
  });
}
