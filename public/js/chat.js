const socket = io();

// HTML Elements
// rooms
const side = document.querySelector('#sidebar');

// chat
const messages = document.querySelector('#messages');
const $form = document.querySelector('#message-form');
const $input = $form.querySelector('input');
const $send = $form.querySelector('button');
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
  const scrollOffset = messages.scrollTop + visibleHeight

  if ((scrollHeight - mHeight) <= Math.ceil(scrollOffset)) {
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

const getMessageSender = (username) => {
  const senderElement = document.createElement('span');
  senderElement.className = 'message-sender';
  senderElement.innerText = username;
  return senderElement;
}

const getMessageStatusElement = (meta) => {
  const statusElement = document.createElement('div'); // information about the message
  statusElement.className = 'message-status';
  statusElement.insertAdjacentElement('beforeend', getTimeElement(meta.createdAt));
  statusElement.insertAdjacentElement('beforeend', getMessageSender(meta.username));
  // TODO: more info to add to the same line later (such as username)
  return statusElement;
}

const getMessageBallon = (text) => {
  const ballon = document.createElement('div');
  ballon.className = 'message-ballon';

  const span = document.createElement('span');
  span.innerText = text;

  ballon.insertAdjacentElement('beforeend', span);

  return ballon;
}

const getMessageBox = (msg) => {
  const box = document.createElement('div');
  box.className = 'message-box';
  box.insertAdjacentElement('beforeend', getMessageStatusElement(msg.meta));
  box.insertAdjacentElement('beforeend', getMessageBallon(msg.text));
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
  box.insertAdjacentElement('beforeend', getMessageStatusElement(loc.meta));
  box.insertAdjacentElement('beforeend', anchor);
  return box;
}


// Listeners
socket.on('share', (location) => {
  messages.insertAdjacentElement('beforeend', getLocationBox(location))
  autoscroll()
})

socket.on('message', (message) => {
  messages.insertAdjacentElement('beforeend', getMessageBox(message))
  autoscroll()
});

socket.on('room', ({ room, users }) => {
  // side
  const roomTitle = document.createElement('h2')
  roomTitle.className = 'room-title'
  roomTitle.innerText = room
  const listTitle = document.createElement('h3')
  listTitle.className = 'list-title'
  listTitle.innerText = 'Users'
  const usersList = document.createElement('ul')
  usersList.className = 'users'
  side.replaceChildren();
  side.insertAdjacentElement('beforeend', roomTitle)
  side.insertAdjacentElement('beforeend', listTitle)
  side.insertAdjacentElement('beforeend', usersList)
  users.forEach((user) => {
    const userItem = document.createElement('li')
    userItem.innerText = user.username
    usersList.insertAdjacentElement('beforeend', userItem)
  })

})

// Senders
$form.addEventListener('submit', (e) => { // send message
  e.preventDefault();

  $send.setAttribute('disabled', 'disabled');
  
  const message = e.target.elements.message;
  
  socket.emit('message', {
      message: message.value,
      meta: {
        username,
        lang: getLang(),
      }
    }, (error) => {
    $send.removeAttribute('disabled');
    message.focus();

    if (error) {
      return console.log(error)
    }

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


socket.emit('join', { username, room, lang: getLang() }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }

});