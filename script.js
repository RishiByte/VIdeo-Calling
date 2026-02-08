// Connect to Socket.IO server
const socket = io();

// Video elements
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

// Room ID (same for both users)
const ROOM_ID = "room1";
socket.emit("join", ROOM_ID);

// Create RTCPeerConnection
const peer = new RTCPeerConnection({
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject"
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject"
    }
  ]
});

// Start call (ONLY one user clicks this)
async function startCall() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  localVideo.srcObject = stream;

  stream.getTracks().forEach(track => {
    peer.addTrack(track, stream);
  });

  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);

  socket.emit("offer", { room: ROOM_ID, offer });
}

// Receive remote stream
peer.ontrack = event => {
  remoteVideo.srcObject = event.streams[0];
};

// Send ICE candidates
peer.onicecandidate = event => {
  if (event.candidate) {
    socket.emit("candidate", {
      room: ROOM_ID,
      candidate: event.candidate
    });
  }
};

// Receive offer
socket.on("offer", async offer => {
  await peer.setRemoteDescription(offer);

  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);

  socket.emit("answer", { room: ROOM_ID, answer });
});

// Receive answer
socket.on("answer", async answer => {
  await peer.setRemoteDescription(answer);
});

// Receive ICE candidate
socket.on("candidate", async candidate => {
  await peer.addIceCandidate(candidate);
});
