// signaling-server.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// rooms: { [roomId]: [{ ws, name }] }
const rooms = {};


wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    const data = JSON.parse(message);
    const { type, room, payload } = data;

    if (type === 'join') {
      ws.room = room;
      ws.userName = payload && payload.name ? payload.name : 'Guest';
      rooms[room] = rooms[room] || [];
      if (rooms[room].length >= 2) {
        ws.send(JSON.stringify({ type: 'room_full' }));
        ws.close();
        return;
      }
      rooms[room].push({ ws, name: ws.userName });
      // Notify the other peer of the new user's name
      if (rooms[room].length === 2) {
        rooms[room].forEach(clientObj => {
          if (clientObj.ws !== ws) clientObj.ws.send(JSON.stringify({ type: 'joined', name: ws.userName }));
          else clientObj.ws.send(JSON.stringify({ type: 'peer_name', name: rooms[room].find(c => c.ws !== ws).name }));
        });
      }
    } else if (type === 'signal') {
      // Relay signaling data to the other peer
      if (rooms[room]) {
        rooms[room].forEach(clientObj => {
          if (clientObj.ws !== ws) clientObj.ws.send(JSON.stringify({ type: 'signal', payload }));
        });
      }
    }
  });


  ws.on('close', () => {
    if (ws.room && rooms[ws.room]) {
      rooms[ws.room] = rooms[ws.room].filter(clientObj => clientObj.ws !== ws);
      // Optionally, notify the other peer that user left (not required for basic P2P)
    }
  });
});

console.log('Signaling server running on ws://localhost:8080');
