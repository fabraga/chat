import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

import express from 'express';
import { createServer } from 'http';

import { Server, Socket } from 'socket.io';

import Filter from 'bad-words';

import { genMessage, genLocation } from './utils/messages.js';
import { addUser, removeUser, getUser, getRoomUsers, getRooms } from './utils/users.js';

const app = express();
const server = createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;

const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));

app.get('/chat', (req, res, next) => {
  res.status(303).send(`<link rel="stylesheet" href="styles.css">
  <script src="/socket.io/socket.io.js"></script>
  <script type="module" src="/js/index.js" defer></script>`);
})

let rooms = []

io.on('connection', (socket) => {
  console.log('New Websocket connection');

  socket.on('arrival', () => {
    rooms = getRooms()
    io.emit('rooms', rooms)
  })

  socket.on('join', (data, cb) => { // data = { username, room, lang, id? }

    const id = data.id
    data.id = socket.id

    if (id) {
      const userLeft = removeUser(id)
    }

    const { error, user } = addUser(data)

    if (error) {
      return cb({ error })
    }

    rooms = getRooms()

    io.emit('rooms', rooms)

    socket.join(user.room)

    const welcomeMessage = {
      type: 'welcome',
      text: 'Welcome to the chat room!',
      user
    }
    socket.emit('message', genMessage(welcomeMessage))

    const joinedMessage = {
      type: 'system',
      text: `${user.username} has joined`,
      user
    }
    socket.broadcast.to(user.room).emit('message', genMessage(joinedMessage))
    
    io.to(user.room).emit('room', {
      room: user.room,
      users: getRoomUsers(user.room)
    })
    
    cb({ id: socket.id })
  })

  socket.on('message', (msg, cb) => {
    const filter = new Filter({ replaceRegex:  /[A-Za-z0-9가-힣_]/g })
    const cleaned = filter.clean(msg.text);
    
    if (!socket.id) {
      console.log('socket.id: ', socket.id)
    }

    const { user } = getUser(socket.id)
    
    if (!user) {
      return cb({ expired: true });
    }

    const message = {
      type: 'sender',
      text: cleaned,
      user
    }

    const generatedMessage = genMessage(message)

    // messages.push(m)
    io.to(user.room).emit('message', generatedMessage)

    if (filter.isProfane(msg.text)) {
      return cb('🚨 Profanity censored 🚨') // ⚠️
    }

    cb() // ✓
  })

  socket.on('sendLocation', (coords, cb) => {
    const { user } = getUser(socket.id)

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


  const leave = (id) => {
    const user = removeUser(id || socket.id)
  
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
  }

  socket.on('leave', (id) => {
    leave(id)
  })

  socket.on('disconnect', () => {
    leave(socket.id)
  })
});

server.listen(port, () => {
  console.log(`Listening to port ${port}...`);
});
