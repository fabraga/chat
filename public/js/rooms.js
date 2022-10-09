const socket = io()

let rooms = []

const chatRooms = document.querySelector('.chat-rooms')
const joinButton = document.querySelector('#join')
const username = document.querySelector('#username')
const room = document.querySelector('#room')

const updateButtons = () => {
  if (username.value && rooms.length) {
    chatRooms.style.display = 'block'
  } else {
    chatRooms.style.display = 'none'
  }

  if (username.value && room.value) {
    joinButton.removeAttribute('disabled')
  } else {
    joinButton.setAttribute('disabled', 'disabled')
  }
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

chatRooms.addEventListener('click', (e) => {
  const room = e.target.innerText
  const username = document.querySelector('#username').value
  location.href = `/chat.html?username=${username}&room=${room}`
});

joinButton.addEventListener('click', (e) => {
  const username = e.target.parentNode.elements.username.value
  const room = e.target.parentNode.elements.room.value
  location.href = `/chat.html?username=${username}&room=${room}`
});



renderRooms = () => {
  rooms.forEach(r => {
    const box = document.createElement('div')
    box.className = 'chat-room'
    const room = document.createElement('span')
    room.className = 'room-name'
    room.innerText = r
    box.insertAdjacentElement('beforeend', room)
    chatRooms.insertAdjacentElement('beforeend', box)
  })
}

socket.on('rooms', (salas) => {
  rooms = [...salas];
  chatRooms.replaceChildren();
  if (rooms.length) {
    this.renderRooms()
  }

  updateButtons()
  
})

socket.emit('arrival', {}, (error) => {
  if (error) {
    alert(error)
    location.href = '/'
  }

})

username.focus()
