# Interview App Server

This is the Node.js/Express server for the Interview App. It provides signaling for WebRTC peer-to-peer connections and handles video uploads.

## Features
- WebSocket signaling server for 1:1 video calls
- Receives and stores uploaded video recordings

## Getting Started

1. Install dependencies:
   ```
npm install
   ```
2. Start the server:
   ```
node server.js
   ```
3. The signaling server runs at `ws://localhost:8080`.
4. The upload endpoint is available at `http://localhost:5000/upload`.

## Requirements
- Node.js (v14 or higher recommended)

## Parcel Cache
- If you use Parcel for any server-side assets, the `.parcel-cache/` folder is not needed for deployment or version control and is excluded by `.gitignore`.

## Folder Structure
- `server.js` - Main server and signaling logic
- `package.json` - Project dependencies

## Notes
- Make sure to start the client app separately (see client README).
- Uploaded videos are saved in the `uploads/` directory.
