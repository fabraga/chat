const socket = io()

// HTML Elements
// room
const side = document.querySelector('#sideinfo');
const usersList = document.querySelector('#users');
const leave = document.querySelector('#leave');

// chat
const messages = document.querySelector('#messages');
const $form = document.querySelector('#message-form');
const $input = $form.querySelector('input');
const $shareLocation = document.querySelector('#share-location');

// HTML Templates


// Options
const { username, room } = Object.fromEntries(new URLSearchParams(location.search));

const autoscroll = () => {
  const mElemen = messages.lastElementChild
  const mStyles = getComputedStyle(mElemen)
  const mMargin = parseInt(mStyles.marginTop) + parseInt(mStyles.marginBottom)
  const mHeight = mElemen.offsetHeight + mMargin

  const visibleHeight = messages.offsetHeight
  const scrollHeight = messages.scrollHeight
  const scrollOffset = messages.scrollTop + visibleHeight + 10

  if ((scrollHeight - mHeight) <= Math.round(scrollOffset)) {
    // messages.scrollTop = messages.scrollHeight
    mElemen.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" })
  }
}

// Variables && Functions
const getLang = () => {
  return navigator.languages && navigator.languages.length ? navigator.languages[0] : navigator.language || navigator.userLanguage || navigator.browserLanguage;
}

const getTime = (createdAt) => {
  const timeFull = createdAt;
  const timeParts = timeFull.split(':');
  const time = timeParts && timeParts.length > 1 ? timeParts[0] + ':' + timeParts[1] : timeFull;
  return time;
}

const getTimeElement = (createdAt) => {
  const timeElement = document.createElement('span');
  timeElement.className = 'message-time';
  timeElement.innerText = getTime(createdAt);
  return timeElement;
}

const getMessageType = (type, text) => {
  const metaContent = document.createElement('span');
  metaContent.className = `message-${type}`;
  metaContent.innerText = text;
  return metaContent;
}

const getMessageMeta = (message) => {
  const statusElement = document.createElement('div'); // information about the message
  statusElement.className = 'message-meta';

  const text = ['welcome', 'system'].includes(message.type) ? message.text : message.user.username;

  statusElement.insertAdjacentElement('beforeend', getTimeElement(message.user.createdAt));
  statusElement.insertAdjacentElement('beforeend', getMessageType(message.type, text));
  return statusElement;
}

const getMessageBallon = (text, received) => {
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

const getMessageBox = (message) => {
  const box = document.createElement('div')
  box.className = 'message-box';
  
  box.insertAdjacentElement('beforeend', getMessageMeta(message))

  if (message.type === 'sender') {
    const receiver = message.user.username !== username.toLocaleLowerCase();
    box.insertAdjacentElement('beforeend', getMessageBallon(message.text, receiver))
  }

  return box;
}

const getLocationBox = (loc) => {
  const box = document.createElement('div');
  box.className = 'message-box';
  const anchor = document.createElement('a');
  anchor.className = 'message-location';
  anchor.setAttribute('href', loc.url);
  anchor.setAttribute('target', '_blank');
  anchor.innerText = 'My Location';
  box.insertAdjacentElement('beforeend', getMessageMeta(loc));
  box.insertAdjacentElement('beforeend', anchor);
  return box;
}

const getErrorMessage = (message) => {
  const box = document.createElement('div')
  const alert = document.createElement('span')
  alert.className = 'message-error'
  alert.innerText = messag
  box.insertAdjacentElement('beforeend', alert)
  return box
}

// Listeners
socket.on('error', (message) => {
  messages.insertAdjacentElement('beforeend', getErrorMessage(message))
  autoscroll()
})

socket.on('share', (location) => {
  messages.insertAdjacentElement('beforeend', getLocationBox(location))
  autoscroll()
})

socket.on('message', (message) => {
  messages.insertAdjacentElement('beforeend', getMessageBox(message))
  autoscroll()
})

socket.on('room', ({ room, users }) => {
  // side
  // const roomTitle = document.createElement('h2')
  // roomTitle.className = 'room-title'
  // roomTitle.innerText = room

  // const listTitle = document.createElement('h3')
  // listTitle.className = 'list-title'
  // listTitle.innerText = 'Users'

  document.querySelector('.room-title').innerText = room

  // side.replaceChildren();
  // side.insertAdjacentElement('beforeend', roomTitle)
  // side.insertAdjacentElement('beforeend', listTitle)

  usersList.replaceChildren()

  users.forEach((user) => {
    const userItem = document.createElement('li')
    userItem.className = 'user-list-item'
    userItem.innerText = user.username
    usersList.insertAdjacentElement('beforeend', userItem)
  })  

})

leave.addEventListener('click', () => {
  location.href = '/'
})

// Senders
$form.addEventListener('submit', (e) => { // send message
  e.preventDefault();

  
  const message = e.target.elements.message;
  message.setAttribute('disabled', 'disabled');
  
  socket.emit('message', { text: message.value }, (error) => {
    message.removeAttribute('disabled');
    message.focus();

    if (error) {
      messages.insertAdjacentElement('beforeend', getErrorMessage(error))
    }

    messages.lastElementChild.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" })

    message.value = '';
    console.log('Message delivered ✓');
  });

});

$shareLocation.addEventListener('click', (e) => {
  
  const geolocation = navigator.geolocation;
  if (!geolocation) {
    return alert('Your browser does NOT support Geolocation.');
  }

  $shareLocation.setAttribute('disabled', 'disabled');

  geolocation.getCurrentPosition((position) => {

    socket.emit('sendLocation', {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
    }, () => {
      $shareLocation.removeAttribute('disabled');
      console.log('Location shared ✓');
    })

  });
})

$shareLocation.addEventListener('mouseenter', (e) => {
  const img = $shareLocation.querySelector('img')
  img.setAttribute('src', 'img/location_on.png')
})
$shareLocation.addEventListener('mouseleave', (e) => {
  const img = $shareLocation.querySelector('img')
  img.setAttribute('src', 'img/location.png')
})

socket.emit('join', { username, room, lang: getLang() }, (error) => {
  if (error) {
    alert(error)
    location.href = '/'
  } else {
    $input.focus()
  }
})