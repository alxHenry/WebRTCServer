const path = require('path');
const cors = require('cors');
const express = require('express');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const PORT = process.env.PORT || 8111;
const rooms = {}; // Object of room ids that contain user ids with sockets

server.listen(PORT, null, () => {
  console.log(`Listening on port ${PORT}`);
});

app.use(cors());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/public/index.html`));
});

io.on('connection', socket => {
  socket.on('create or join room', (userId, threadId) => {
    console.log(`User ${userId} joining room ${threadId}`);
    if (!rooms[threadId]) {
      rooms[threadId] = { [userId]: socket };
    } else {
      const currentRoom = rooms[threadId];

      // Notify other members of room of join
      Object.keys(currentRoom).forEach(key => {
        const userSocket = currentRoom[key];
        console.log(`Telling user ${key} that user ${userId} joined`);
        userSocket.emit('peer.connected', { newUserId: userId, threadId });
      });

      // Now that everyone has been notified, add our socket
      currentRoom[userId] = socket;
    }
    console.log(`User ${userId} successfully joined room ${threadId}`);
  });

  socket.on('msg', data => {
    const { toUserId, byUserId, threadId, type } = data;

    if (rooms[threadId] && rooms[threadId][toUserId]) {
      console.log(
        `Redirecting msg of type ${type} to user ${toUserId} from ${byUserId} on thread ${threadId}`
      );
      rooms[threadId][toUserId].emit('msg', data);
    } else {
      console.log(`Invalid user ${toUserId} on thread ${threadId}`);
    }
  });

  socket.on('disconnect', (userId, threadId) => {
    const currentRoom = rooms[threadId];
    if (!currentRoom) {
      return;
    }

    delete currentRoom[userId];

    // Alert all other users in the room that someone left
    Object.keys(currentRoom).forEach(key => {
      const userSocket = currentRoom[key];
      userSocket.emit('peer.disconnected', userId, threadId);
    });
  });
});
