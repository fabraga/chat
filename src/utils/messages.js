const getLocaleTime = (language) => {
  const lang = language || 'en';
  return new Date().toLocaleTimeString(lang, { hour12: false });
}

const getMeta = (meta) => {
  const username = meta && meta.username ? meta.username : 'User';
  const language = meta && meta.lang ? meta.lang : 'en'
  return {
    createdAt: getLocaleTime(language),
    username
  }
}

const genMessage = ({ message, meta }) => {
  return {
    text: message,
    meta: getMeta(meta)
  }
}

const genLocation = ({ coords, meta }) => {
  const location = {
    url: `https://google.com/maps/?q=${coords.lat},${coords.lon}`,
    meta: getMeta(meta)
  }
  return location;
}

module.exports = {
  genMessage,
  genLocation
}