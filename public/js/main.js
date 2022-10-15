// const socket = io()

const getRoomName = (text) => {
  return text.substring(0, 1).toUpperCase() + text.substring(1, text.indexOf('(')).trim() 
}

export class Main extends HTMLElement {
  static App;

  rooms = []

  constructor(app) {
    super();
    
    Main.App = app

    this.name = 'main'
    
    this.build()

    this.init()

  }


  updateJoin = () => {
    if (this.userName.value && this.roomName.value) {
      this.joinButton.removeAttribute('disabled')
    } else {
      this.joinButton.setAttribute('disabled', 'disabled')
    }
  }
  
  updateButtons = () => {
    if (this.userName.value && this.rooms.length) {
      // chatRooms.style.display = 'block'
      this.chatRooms.removeAttribute('disabled')
    } else {
      // chatRooms.style.display = 'none'
      this.chatRooms.setAttribute('disabled', 'disabled')
    }
  
    this.updateJoin()
  }

  updateRooms(salas) {
    this.rooms = [...salas]
  
    this.chatRooms.style.padding = this.rooms.length ? '.4vmin' : 0
  
    this.chatRooms.replaceChildren()
  
    this.updateButtons()
  
    if (this.rooms.length) {
      this.renderRooms()
    }
  }

  
  init() {
    this.userName.addEventListener('input', (e) => {
      this.updateJoin()
    
      this.updateButtons()
    
    })

    this.roomName.addEventListener('input', (e) => {
      this.updateJoin()
      
      this.updateButtons()
    
    })

    this.chatRooms.addEventListener('mouseover', (e) => {
      if (!this.chatRooms.getAttribute('disabled')) {
        if (e.target.innerText) {
          this.roomName.value = getRoomName(e.target.innerText)
          this.updateJoin()
        }
      }
    })
    
    this.chatRooms.addEventListener('click', (e) => {
      if (this.chatRooms.hasAttribute('disabled')) {
        return;
      }
      
      this.roomName.value = getRoomName(e.target.innerText)

      this.enterRoom()
    });

    this.form.addEventListener('submit', (e) => {
      e.preventDefault()
    
      this.enterRoom()
    });
    
    
  }

  enterRoom() {
    const userName = this.userName.value
    const roomName = this.roomName.value

    const nextState = { userName, roomName }
    const nextTitle = ''
    const nextURL = location.origin + `/chat?u=${userName}&r=${roomName}`
    
    // This will create a new entry in the browser's history, without reloading
    window.history.pushState(nextState, nextTitle, nextURL);
    // This will replace the current entry in the browser's history, without reloading
    // window.history.replaceState(nextState, nextTitle, nextURL);
   
    Main.App.navigate('room')
  }

  renderRooms = () => {
    this.rooms.forEach(r => {
      const room = document.createElement('li')
      room.className = 'chat-room'
      room.innerText = `${r.room} (${r.users})`
      this.chatRooms.insertAdjacentElement('beforeend', room)
    })
  }

  render() {
    this.userName.focus()
  }

  build() {
    const entrance = document.createElement('div')
    entrance.className = 'entrance'
    const entranceForm = document.createElement('div')
    entranceForm.className = 'entrance-form'
    const entranceTitle = document.createElement('h1')
    entranceTitle.setAttribute('id', 'entrance-title')
    entranceTitle.innerText = 'CHAT'
    const formRooms = document.createElement('div')
    formRooms.className = 'form-rooms'
    const form = document.createElement('form')
    const chatRooms = document.createElement('ul')
    chatRooms.className = 'chat-rooms'
    const userLabel = document.createElement('label')
    userLabel.setAttribute('for', 'username')
    userLabel.innerText = 'You'
    const userName = document.createElement('input')
    userName.setAttribute('id', 'username')
    userName.setAttribute('type', 'text')
    userName.setAttribute('name', 'username')
    userName.setAttribute('placeholder', 'Your name')
    userName.setAttribute('required', 'required')
    const roomLabel = document.createElement('label')
    roomLabel.setAttribute('for', 'room')
    roomLabel.innerText = 'Room'
    const roomName = document.createElement('input')
    roomName.setAttribute('id', 'room')
    roomName.setAttribute('type', 'text')
    roomName.setAttribute('name', 'room')
    roomName.setAttribute('placeholder', 'Rom name')
    roomName.setAttribute('required', 'required')
    const joinButton = document.createElement('button')
    joinButton.setAttribute('id', 'Join')
    joinButton.setAttribute('disabled', 'disabled')
    joinButton.innerText = 'Join'
    form.insertAdjacentElement('beforeend', userLabel)
    form.insertAdjacentElement('beforeend', userName)
    form.insertAdjacentElement('beforeend', roomLabel)
    form.insertAdjacentElement('beforeend', roomName)
    form.insertAdjacentElement('beforeend', joinButton)
    formRooms.insertAdjacentElement('beforeend', form)
    formRooms.insertAdjacentElement('beforeend', chatRooms)
    entranceForm.insertAdjacentElement('beforeend', entranceTitle)
    entranceForm.insertAdjacentElement('beforeend', formRooms)
    entrance.insertAdjacentElement('beforeend', entranceForm)
    
    
    this.append(entrance)
    
    this.userName = userName
    this.roomName = roomName
    this.joinButton = joinButton
    this.form = form
    this.chatRooms = chatRooms
  }
}


customElements.define('chat-main', Main);

