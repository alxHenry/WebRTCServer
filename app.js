const path = require('path');
const cors = require('cors');
const express = require('express');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const PORT = process.env.PORT || 8111;

server.listen(PORT, null, () => {
  console.log(`Listening on port ${PORT}`);
});

app.use(cors());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/public/index.html`));
});

io.on('connection', socket => {
  socket.on('new peer candidate', (userId, threadId, candidate) => {
    socket.broadcast.emit('new peer candidate', userId, threadId, candidate);
  });

  socket.on('create or join room', (userId, threadId, desc) => {
    socket.broadcast.emit('peer desc for thread', userId, threadId, desc);
  });
});
