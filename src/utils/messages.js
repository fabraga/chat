const getLocaleTime = (language) => {
  const lang = language || 'en';
  return new Date().toLocaleTimeString(lang, { hour12: false });
}

const getMeta = (user) => {
  const username = user && user.username ? user.username : 'User';
  const language = user && user.lang ? user.lang : 'en'
  return {
    createdAt: getLocaleTime(language),
    username
  }
}


export const genMessage = ({ type, text, user }) => {
  return {
    type,
    text,
    user: getMeta(user)
  }
}
  
export const genLocation = ({ type, text, coords, user }) => {
  const location = {
    type,
    text,
    url: `https://google.com/maps/?q=${coords.lat},${coords.lon}`,
    user: getMeta(user)
  }
  return location;
}
  
// export default {
//   genMessage,
//   genLocation
// }