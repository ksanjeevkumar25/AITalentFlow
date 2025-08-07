# Interview App Client

This is the React client for the Interview App. It provides a simple UI for peer-to-peer video calls, recording, and uploading interview sessions.

## Features
- Join a room with your name and meeting number
- Peer-to-peer video call (1:1)
- Display local and remote participant names
- Record and upload video sessions

## Getting Started

1. Install dependencies:
   ```
npm install
   ```
2. Start the client in development mode:
   ```
npm start
   ```
3. To build for production:
   ```
npm run build
   ```
   The production build will be output to the `dist/` or `build/` folder, depending on your configuration.

## Parcel Cache
- The `.parcel-cache/` folder is used by Parcel to speed up builds. It is not needed for deployment or version control and is excluded by `.gitignore`.
- If you encounter build issues, you can safely delete `.parcel-cache/` and rebuild; Parcel will recreate it as needed.

## Requirements
- Node.js (v14 or higher recommended)
- The signaling server must be running (see server README)

## Folder Structure
- `App.js` - Main React component
- `index.html` - App entry point
- `package.json` - Project dependencies

## Notes
- Make sure the signaling server is running at `ws://localhost:8080`.
- Video uploads are sent to `http://localhost:5000/upload`.
