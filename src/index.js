const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { genMessage, genLocation } = require('./utils/messages');
const { addUser, removeUser, getUser, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const public = path.join(__dirname, '../public');

app.use(express.static(public));

// let count = 0;
// const messages = [];

io.on('connection', (socket) => {
  console.log('New Websocket connection');
  
  // socket.emit('message', genMessage('Welcome!'))
  // socket.broadcast.emit('message', genMessage(`[a user has joined]`))

  socket.on('join', (data, cb) => { // data = { username, room, lang }
    const { error, meta } = addUser({ id: socket.id, ...data })

    if (error) {
      return cb(error)
    }

    socket.join(meta.room)

    const joiner = meta.username;

    socket.emit('message', genMessage({ message: 'Welcome!', meta }))

    socket.broadcast.to(meta.room).emit('message', genMessage({ message: `[${joiner} joined]`, meta: {...meta, username: 'Admin' } }))

    io.to(meta.room).emit('room', {
      room: meta.room,
      users: getRoomUsers(meta.room)
    })

    cb()
  })

  socket.on('message', (msg, cb) => {
    const filter = new Filter()
    if (filter.isProfane(msg.message)) {
      return cb('[Profanity not allowed]')
    }

    const user = getUser(socket.id)

    // messages.push(m)
    io.to(user.room).emit('message', genMessage(msg, user))
    cb() // ✓
  })

  socket.on('sendLocation', (coords, cb) => {
    const user = getUser(socket.id)
    io.to(user.room).emit('share', genLocation({ coords, meta: user }))
    cb()
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if (user) {
      io.to(user.room).emit('message', genMessage({ message: `[${user.username} left]`, meta: {...user, username: 'Admin' } }))

      io.to(user.room).emit('room', {
        room: user.room,
        users: getRoomUsers(user.room)
      })
    }
  })
});

server.listen(port, () => {
  console.log(`Listening to port ${port}...`);
});