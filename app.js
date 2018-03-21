const path = require('path');
const express = require('express');
const app = express();
const cors = require('cors');
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
  console.log(`Socket connected: ${socket}`);

  socket.on('new peer candidate', candidate => {
    socket.broadcast.emit('new peer candidate', candidate);
  });

  socket.on('peer sdp', sdp => {
    socket.broadcast.emit('peer sdp', sdp);
  });

  socket.on('create or join', room => {
    console.log('Received request to create or join room');

  });
});
