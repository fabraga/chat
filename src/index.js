const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { genMessage, genLocation } = require('./utils/messages');
const { addUser, removeUser, getUser, getRoomUsers, getRooms } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const public = path.join(__dirname, '../public');

app.use(express.static(public));


io.on('connection', (socket) => {
  // console.log('New Websocket connection');

  socket.on('arrival', () => {
    rooms = getRooms()
    io.emit('rooms', rooms)
  })
  
  socket.on('join', (data, cb) => { // data = { username, room, lang }
    const { error, user } = addUser({ id: socket.id, ...data })

    if (error) {
      return cb(error)
    }

    rooms = getRooms()
    io.emit('rooms', rooms)

    const welcomeMessage = {
      type: 'welcome',
      text: 'Welcome to the chat room!',
      user
    }

    const joinedMessage = {
      type: 'system',
      text: `${user.username} has joined`,
      user
    }

    socket.join(user.room)

    socket.emit('message', genMessage(welcomeMessage))

    socket.broadcast.to(user.room).emit('message', genMessage(joinedMessage))

    io.to(user.room).emit('room', {
      room: user.room,
      users: getRoomUsers(user.room)
    })

    cb()
  })

  socket.on('message', (msg, cb) => {
    const filter = new Filter({ replaceRegex:  /[A-Za-z0-9가-힣_]/g })
    const cleaned = filter.clean(msg.text);
    
    if (!socket.id) {
      console.log('socket.id: ', socket.id)
    }

    const user = getUser(socket.id)
    
    if (!user) {
      return cb({ expired: true });
    }

    const message = {
      type: 'sender',
      text: cleaned,
      user
    }

    // messages.push(m)
    io.to(user.room).emit('message', genMessage(message))

    if (filter.isProfane(msg.text)) {
      return cb('🚨 Profanity  censored 🚨') // ⚠️
    }

    cb() // ✓
  })

  socket.on('sendLocation', (coords, cb) => {
    const user = getUser(socket.id)

    if (!user) {
      return socket.emit('error', 'User not found')
    }

    const location = {
      type: 'system',
      coords,
      text: `${user.username} shared their location`,
      user
    }
    io.to(user.room).emit('share', genLocation(location))
    cb()
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if (user) {
      const leaveMessage = {
        type: 'system',
        text: `${user.username} has left`,
        user
      }
  
      io.to(user.room).emit('message', genMessage(leaveMessage))

      io.to(user.room).emit('room', {
        room: user.room,
        users: getRoomUsers(user.room)
      })

      rooms = getRooms()
      io.emit('rooms', rooms)
  
    }
  })
});

server.listen(port, () => {
  console.log(`Listening to port ${port}...`);
});