
import React, { useEffect, useRef, useState } from "react";

const App = () => {
  const jitsiContainer = useRef(null);
  const [mediaBlobUrl, setMediaBlobUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [remoteName, setRemoteName] = useState("Other Participant");
  const [ws, setWs] = useState(null);
  const [pc, setPc] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);

  // Jitsi code (commented out, as requested)
  /* ...existing code... */

  // --- WebRTC/Signaling logic ---
  useEffect(() => {
    if (!joined) return;
    let wsConn;
    let peerConn;
    let localStreamCurrent;

    const start = async () => {
      // 1. Get local media
      localStreamCurrent = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(localStreamCurrent);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamCurrent;
      }
      console.log("[WebRTC] Got local media stream");

      // 2. Connect to signaling server
      wsConn = new window.WebSocket("ws://localhost:8080");
      setWs(wsConn);
      console.log("[Signaling] Connecting to ws://localhost:8080");
      // wsConn = new window.WebSocket("wss://signalserver-gdhmhtfcgwdzbjd6.uksouth-01.azurewebsites.net");
      // setWs(wsConn);
      // console.log("[Signaling] Connecting to wss://signalserver-gdhmhtfcgwdzbjd6.uksouth-01.azurewebsites.net");
    
      // 3. Setup peer connection
      peerConn = new window.RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" }
        ]
      });
      setPc(peerConn);
      console.log("[WebRTC] Created RTCPeerConnection");

      // 4. Add local tracks
      localStreamCurrent.getTracks().forEach(track => {
        peerConn.addTrack(track, localStreamCurrent);
        console.log(`[WebRTC] Added local track: ${track.kind}`);
      });

      // 5. Handle ICE candidates
      peerConn.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("[WebRTC] Sending ICE candidate", event.candidate);
          wsConn.send(JSON.stringify({ type: "signal", room, payload: { candidate: event.candidate } }));
        }
      };

      // 6. Handle remote stream
      peerConn.ontrack = (event) => {
        console.log("[WebRTC] Received remote track", event.streams);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // 7. WebSocket signaling
      wsConn.onopen = () => {
        console.log("[Signaling] WebSocket open, joining room", room);
        wsConn.send(JSON.stringify({ type: "join", room, payload: { name } }));
      };
      wsConn.onmessage = async (msg) => {
        const data = JSON.parse(msg.data);
        console.log("[Signaling] Message received", data);
        if (data.type === "joined") {
          // If second user, create offer
          if (data.name) setRemoteName(data.name);
          const offer = await peerConn.createOffer();
          await peerConn.setLocalDescription(offer);
          console.log("[WebRTC] Created and set local offer", offer);
          wsConn.send(JSON.stringify({ type: "signal", room, payload: { sdp: offer } }));
        } else if (data.type === "peer_name") {
          if (data.name) setRemoteName(data.name);
        } else if (data.type === "signal") {
          if (data.payload.sdp) {
            if (data.payload.sdp.type === "offer") {
              await peerConn.setRemoteDescription(new RTCSessionDescription(data.payload.sdp));
              const answer = await peerConn.createAnswer();
              await peerConn.setLocalDescription(answer);
              wsConn.send(JSON.stringify({ type: "signal", room, payload: { sdp: answer } }));
            } else if (data.payload.sdp.type === "answer") {
              await peerConn.setRemoteDescription(new RTCSessionDescription(data.payload.sdp));
            }
          } else if (data.payload.candidate) {
            try {
              await peerConn.addIceCandidate(new RTCIceCandidate(data.payload.candidate));
            } catch (e) {}
          }
        }
      };
    };
    start();

    // Cleanup
    return () => {
      if (wsConn) wsConn.close();
      if (peerConn) peerConn.close();
      if (localStreamCurrent) localStreamCurrent.getTracks().forEach(track => track.stop());
    };
    // eslint-disable-next-line
  }, [joined, room]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    recordedChunks.current = [];
    mediaRecorder.ondataavailable = (e) => recordedChunks.current.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks.current, { type: "video/webm" });
      setMediaBlobUrl(URL.createObjectURL(blob));
    };
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const uploadRecording = async () => {
    const blob = new Blob(recordedChunks.current, { type: "video/webm" });
    const formData = new FormData();
    formData.append("file", blob, "interview.webm");
    await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    });
    alert("Uploaded!");
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f4f6fb"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        padding: 32,
        maxWidth: 480,
        width: "100%"
      }}>
        <h2 style={{
          textAlign: "center",
          marginBottom: 24,
          color: "#2d3748",
          fontWeight: 700,
          letterSpacing: 1
        }}>Interview Room</h2>

        {!joined ? (
          <form
            onSubmit={e => {
              e.preventDefault();
              if (room.trim() && name.trim()) setJoined(true);
            }}
            style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 16 }}
          >
            <label style={{ fontWeight: 500, marginBottom: 4 }}>Your Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                padding: 12,
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                fontSize: 16,
                outline: "none"
              }}
            />
            <div style={{ height: 20 }} />
            <label style={{ fontWeight: 500, marginBottom: 4 }}>Meeting Number</label>
            <input
              type="text"
              placeholder="Enter meeting number or room name"
              value={room}
              onChange={e => setRoom(e.target.value)}
              style={{
                padding: 12,
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                fontSize: 16,
                outline: "none"
              }}
            />
            <button
              type="submit"
              style={{
                background: "#3182ce",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "10px 18px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(49,130,206,0.08)",
                transition: "background 0.2s"
              }}
            >
              Join Room
            </button>
          </form>
        ) : (
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: 24, gap: 24 }}>
            {/* Remote video (big) */}
            <div style={{ position: "relative" }}>
              <video ref={remoteVideoRef} autoPlay playsInline style={{ width: 360, height: 270, borderRadius: 12, background: "#222" }} />
              <div style={{ position: "absolute", bottom: 8, left: 8, color: "#fff", background: "rgba(0,0,0,0.5)", borderRadius: 4, padding: "2px 8px", fontSize: 16 }}>{remoteName}</div>
            </div>
            {/* Local video (small) */}
            <div style={{ position: "relative" }}>
              <video ref={localVideoRef} autoPlay muted playsInline style={{ width: 120, height: 90, borderRadius: 8, background: "#222" }} />
              <div style={{ position: "absolute", bottom: 4, left: 4, color: "#fff", background: "rgba(0,0,0,0.5)", borderRadius: 4, padding: "2px 8px", fontSize: 12 }}>{name} (You)</div>
            </div>
          </div>
        )}

        <div style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          marginBottom: 24
        }}>
          <button onClick={startRecording} style={{
            background: "#3182ce",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 18px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(49,130,206,0.08)",
            transition: "background 0.2s"
          }}>Start Recording</button>
          <button onClick={stopRecording} style={{
            background: "#e53e3e",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 18px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(229,62,62,0.08)",
            transition: "background 0.2s"
          }}>Stop Recording</button>
          <button onClick={uploadRecording} style={{
            background: "#38a169",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 18px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(56,161,105,0.08)",
            transition: "background 0.2s"
          }}>Upload Recording</button>
        </div>
        {mediaBlobUrl && (
          <video src={mediaBlobUrl} controls style={{
            width: "100%",
            borderRadius: 8,
            boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
            marginTop: 8
          }} />
        )}
      </div>
    </div>
  );
};

export default App;
