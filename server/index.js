const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const markHandling = require('./routes/markHandling');
const postHandling = require('./routes/postHandling');

const app = express();
const server = http.createServer(app);
const io = socketIo(server
//   ,{
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"]
//   }
// }
);

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../client')));
app.use(express.static(path.join(__dirname, '../client/dist')));

app.use(markHandling);
app.use(postHandling);

io.on('connection', (socket) => {
  console.log('新客戶端連接');

  const userId = socket.id;
  socket.emit('init', { id: userId });

  socket.on('mouseMove', (data) => {
    data.id = userId;
    socket.broadcast.emit('mouseMove', data);
  });

  socket.on('mapMove', (data) => {
    socket.broadcast.emit('mapMove', data);
  });

  socket.on('newMarker', (data) => {
    socket.broadcast.emit('newMarker', data);
  });


  socket.on('disconnect', () => {
    console.log('客戶端斷開連接');
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});