const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static(__dirname));

io.on("connection", socket => {
  socket.on("join", room => {
    socket.join(room);
  });

  socket.on("offer", ({ room, offer }) => {
    socket.to(room).emit("offer", offer);
  });

  socket.on("answer", ({ room, answer }) => {
    socket.to(room).emit("answer", answer);
  });

  socket.on("candidate", ({ room, candidate }) => {
    socket.to(room).emit("candidate", candidate);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log("Server running on port", PORT));
