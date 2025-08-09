// Ultra-minimal server.js for Azure App Service troubleshooting
console.log('Starting ultra-minimal server.js');

// The simplest possible HTTP server
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

  // Send a simple text response for any request
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello from Azure! Path: ' + req.url);
  
}).listen(process.env.PORT || 8080, function() {
  console.log('Server started on port ' + (process.env.PORT || 8080));
});
