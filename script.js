const socket = io();
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

async function startCall() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  localVideo.srcObject = stream;
  stream.getTracks().forEach(track => peer.addTrack(track, stream));

  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  socket.emit("offer", offer);
}

peer.ontrack = event => {
  remoteVideo.srcObject = event.streams[0];
};

peer.onicecandidate = event => {
  if (event.candidate) {
    socket.emit("candidate", event.candidate);
  }
};

socket.on("offer", async offer => {
  await peer.setRemoteDescription(offer);
  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);
  socket.emit("answer", answer);
});

socket.on("answer", answer => {
  peer.setRemoteDescription(answer);
});

socket.on("candidate", candidate => {
  peer.addIceCandidate(candidate);
});
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
