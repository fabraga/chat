const users = [];

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room, lang }) => {
  // clean the data
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  // validate the data
  if (!username) {
    return { error: 'Username is required.' }
  }
  if (!room) {
    return { error: 'Room is required.' }
  }
  
  // check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username
  })

  // validate username
  if (existingUser) {
    return { error: 'Username already in use! Please pick another.' }
  }

  // store user
  const user = { id, username, room, lang }
  users.push(user)

  return { user }
}

const removeUser = (id) => {
  const index = users.findIndex(u => u.id === id) // findIndex is faster than find cuz stops searching when found
  if (index !== -1) {
    return users.splice(index, 1)[0]
  }
}

const getUser = (id) => {
  return users.find(u => u.id === id)
}

const getRoomUsers = (room) => {
  return users.filter(u => u.room === room)
}

const getRooms = () => {
  return [...new Set(users.map(u => u.room))]
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getRoomUsers,
  getRooms
}