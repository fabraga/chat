const socket = io()


export class ChatRoom extends HTMLElement {
  static App
  static room

  constructor(app) {
    super()
    
    ChatRoom.App = app
    ChatRoom.room = this

    this.name = 'room'
    
    this.init()
  }

  leaveRoom() {
    sessionStorage.clear()

    const username = this.userName
    
    const nextURL = location.origin + `/`
    const nextTitle = 'Chat Main'
    const nextState = { left: username }
    
    // This will create a new entry in the browser's history, without reloading
    window.history.pushState(nextState, nextTitle, nextURL);
    // This will replace the current entry in the browser's history, without reloading
    // window.history.replaceState(nextState, nextTitle, nextURL);
   
    socket.emit('leave')
    ChatRoom.App.navigate('main')
  }

  render() {
    const id = sessionStorage.getItem('id')

    sessionStorage.clear()
    
    const { u, r } = Object.fromEntries(new URLSearchParams(location.search))
    this.userName = u
    this.roomName = r

    if (u && r) {
      const joinData = { username: this.userName, room: this.roomName, lang: this.getLang(), id }
        
      socket.emit('join', joinData, (response) => {
        if (response.error) {
          alert(response.error)
          this.leaveRoom()
        } else {
          sessionStorage.setItem('id', response.id)
          this._input.focus()
        }

      })
    }
  }

  init() {
    this.innerHTML = this.build()

    // room
    this._side = this.querySelector('#sideinfo')
    this._roomTitle = this.querySelector('.room-title')
    this._usersList = this.querySelector('#users')
    this._leaveButton = this.querySelector('#leave')
    
    // chat
    this._messages = this.querySelector('#messages')
    this._form = this.querySelector('#message-form')
    this._input = this._form.querySelector('input')
    this._shareLocation = this.querySelector('#share-location')
    this._sendButton = this.querySelector('#message-send')
    

    this._leaveButton.addEventListener('click', () => {
      this.leaveRoom()
    })


    this._form.addEventListener('submit', (e) => { // send message
      e.preventDefault()
      
      const message = e.target.elements.message
      message.setAttribute('disabled', 'disabled')
      
      socket.emit('message', { text: message.value }, (error) => {
        if (error) {
          if (error.expired) {
            this.leaveRoom()

          } else {
            this._messages.insertAdjacentElement('beforeend', this.getErrorMessage(error))
          }
        }
    
        this._messages.lastElementChild.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" })
    
        this._sendButton.style.display = 'none'
    
        message.value = ''
        message.removeAttribute('disabled')
        message.focus()
      })
    
    })
    

    this._shareLocation.addEventListener('click', (e) => {
      
      const geolocation = navigator.geolocation;
      if (!geolocation) {
        return alert('Your browser does NOT support Geolocation.')
      }
    
      this._shareLocation.setAttribute('disabled', 'disabled');
    
      geolocation.getCurrentPosition((position) => {
    
        socket.emit('sendLocation', {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        }, () => {
          this._shareLocation.removeAttribute('disabled');
        })
    
      })
    })
    

    this._shareLocation.addEventListener('mouseenter', (e) => {
      this._shareLocation.querySelector('img').setAttribute('src', 'img/location_on.png')
    })
    this._shareLocation.addEventListener('mouseleave', (e) => {
      this._shareLocation.querySelector('img').setAttribute('src', 'img/location.png')
    })
    
    this._sendButton.addEventListener('mouseenter', (e) => {
      this._sendButton.querySelector('img').setAttribute('src', 'img/send1.png');
    })
    this._sendButton.addEventListener('mouseleave', (e) => {
      this. _sendButton.querySelector('img').setAttribute('src', 'img/send.png');
    })
    
    this._input.addEventListener('input', (e) => {
      const message = e.target;
    
      message.parentNode.querySelector('#message-send').style.display = message.value.trim().length ? 'block' : 'none';
    })
    
  }

  autoscroll() {
    this._messages.lastElementChild.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" })
  }


  getLang() {
    return navigator.languages && navigator.languages.length ? navigator.languages[0] : navigator.language || navigator.userLanguage || navigator.browserLanguage;
  }
  
  getTime(createdAt) {
    const timeFull = createdAt;
    const timeParts = timeFull.split(':');
    const time = timeParts && timeParts.length > 1 ? timeParts[0] + ':' + timeParts[1] : timeFull;
    return time;
  }
  
  getTimeElement(createdAt) {
    const timeElement = document.createElement('span');
    timeElement.className = 'message-time';
    timeElement.innerText = this.getTime(createdAt);
    return timeElement;
  }
  
  getMessageType(type, text) {
    const metaContent = document.createElement('span');
    metaContent.className = `message-${type}`;
    metaContent.innerText = text;
    return metaContent;
  }
  
  getMessageMeta(message) {
    const statusElement = document.createElement('div'); // information about the message
    statusElement.className = 'message-meta';
  
    const text = ['welcome', 'system'].includes(message.type) ? message.text : message.user.username;
  
    statusElement.insertAdjacentElement('beforeend', this.getTimeElement(message.user.createdAt));
    statusElement.insertAdjacentElement('beforeend', this.getMessageType(message.type, text));
    return statusElement;
  }
  
  getMessageBallon(text, received) {
    const ballon = document.createElement('div');
    ballon.className = 'message-ballon';
  
    if (received) {
      ballon.className += ' message-ballon-received';
    }
  
    const span = document.createElement('span');
    span.innerText = text;
  
    ballon.insertAdjacentElement('beforeend', span);

    return ballon;
  }
  
  getMessageBox(message) {
    const box = document.createElement('div')
    box.className = 'message-box';
    
    box.insertAdjacentElement('beforeend', this.getMessageMeta(message))
  
    if (message.type === 'sender') {

      const receiver = message.user.username !== this.userName.toLowerCase();
      const messageBallon = this.getMessageBallon(message.text, receiver)

      box.insertAdjacentElement('beforeend', messageBallon)
    }
    
    return box;
  }
  
  getLocationBox(loc) {
    const box = document.createElement('div');
    box.className = 'message-box';
    const anchor = document.createElement('a');
    anchor.className = 'message-location';
    anchor.setAttribute('href', loc.url);
    anchor.setAttribute('target', '_blank');
    anchor.innerText = 'My Location';
    box.insertAdjacentElement('beforeend', this.getMessageMeta(loc));
    box.insertAdjacentElement('beforeend', anchor);
    return box;
  }
  
  getErrorMessage(message) {
    const box = document.createElement('div')
    box.className = 'message-error'
    const alert = document.createElement('span')
    alert.innerText = message
    box.insertAdjacentElement('beforeend', alert)
    return box
  }
  

  build() {
    return `
      <div class="chat">
        <div id="sidebar" class="chat-side">
          <div id="sideinfo" class="chat-info">
            <h2 class="room-title"></h2>
            <h3 class="list-title">Users</h3>
          </div>
          <ul id="users" class="users"></ul>
          <div id="sidecontrols" class="chat-controls">
            <button id="leave" class="chat-leave" title="Leave room">🡄</button>
          </div>
        </div>
        <div class="chat-main">
          <div id="messages" class="chat-messages"></div>
          <div class="compose">
            <form id="message-form">
              <input id="message" placeholder="Type a message" name="message" type="text" required autocomplete="off">
              <button id="message-send" class="send" style="display: none"><img src="img/send.png" class="send-icon"></button>
            </form>
            <button id="share-location" class="send" title="Share location"><img src="img/location.png" class="send-icon"></button>
          </div>
        </div>
      </div>
    `
  }

  static postMessage(message) {
    this.room._messages.insertAdjacentElement('beforeend', message)
    this.room.autoscroll()
  }
  
}

customElements.define('chat-room', ChatRoom);


socket.on('room', ({ room, users }) => {
  const _node = ChatRoom.App.getNode('room')
  _node.querySelector('.room-title').innerText = room

  _node._usersList.replaceChildren()

  users.forEach((user) => {
    const userItem = document.createElement('li')
    userItem.className = 'user-list-item'
    userItem.innerText = user.username
    _node._usersList.insertAdjacentElement('beforeend', userItem)
  })
})


socket.on('error', (message) => {
  ChatRoom.postMessage(ChatRoom.room.getErrorMessage(message))
})

socket.on('share', (location) => {
  ChatRoom.postMessage(ChatRoom.room.getLocationBox(location))
})

socket.on('message', (message) => {
  ChatRoom.postMessage(ChatRoom.room.getMessageBox(message))
})

window.onpopstate = (event) => {
  ChatRoom.room.leaveRoom()
}

// window.onunload = (event) => {
//   ChatRoom.room.leaveRoom()
// }