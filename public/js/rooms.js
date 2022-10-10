const socket = io()

let rooms = []

const chatRooms = document.querySelector('.chat-rooms')
const joinButton = document.querySelector('#join')
const username = document.querySelector('#username')
const room = document.querySelector('#room')


const updateJoin = () => {
  if (username.value && room.value) {
    joinButton.removeAttribute('disabled')
  } else {
    joinButton.setAttribute('disabled', 'disabled')
  }
}

const updateButtons = () => {
  if (username.value && rooms.length) {
    // chatRooms.style.display = 'block'
    chatRooms.removeAttribute('disabled')
  } else {
    // chatRooms.style.display = 'none'
    chatRooms.setAttribute('disabled', 'disabled')
  }

  updateJoin()
}

username.addEventListener('input', (e) => {
  if (e.target.value && room.value) {
    joinButton.removeAttribute('disabled')
  } else {
    joinButton.setAttribute('disabled', 'disabled')
  }

  updateButtons()

})

room.addEventListener('input', (e) => {
  if (e.target.value && username.value) {
    joinButton.removeAttribute('disabled')
  } else {
    joinButton.setAttribute('disabled', 'disabled')
  }

  updateButtons()

})

const getRoomName = (text) => {
  room.value = text.substring(0, 1).toUpperCase() + text.substring(1, text.indexOf('(')).trim() 
}

chatRooms.addEventListener('mouseover', (e) => {
  if (!chatRooms.getAttribute('disabled')) {
    if (e.target.innerText) {
      getRoomName(e.target.innerText)
      updateJoin()
    }
  }
})

chatRooms.addEventListener('click', (e) => {
  if (chatRooms.hasAttribute('disabled')) {
    return;
  }
  const username = document.querySelector('#username').value
  getRoomName(e.target.innerText)
  location.href = `/chat.html?username=${username}&room=${room.value}`
});

joinButton.addEventListener('click', (e) => {
  const username = e.target.parentNode.elements.username.value
  const room = e.target.parentNode.elements.room.value
  location.href = `/chat.html?username=${username}&room=${room}`
});



renderRooms = () => {
  rooms.forEach(r => {
    const room = document.createElement('li')
    room.className = 'chat-room'
    room.innerText = `${r.room} (${r.users})`
    chatRooms.insertAdjacentElement('beforeend', room)
  })
}

socket.on('rooms', (salas) => {
  rooms = [...salas];
  
  chatRooms.style.padding = rooms.length ? '.4vmin' : 0

  chatRooms.replaceChildren();

  updateButtons()

  if (rooms.length) {
    this.renderRooms()
  }
})

socket.emit('arrival', {}, (error) => {
  if (error) {
    alert(error)
    location.href = '/'
  }

})

username.focus()
