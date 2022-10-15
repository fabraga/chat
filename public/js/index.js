import { Main } from "./main.js"
import { ChatRoom } from "./room.js"

const socket = io()


class App {

  static init() {

    this.body = document.querySelector('body')
    
    const main = new Main(this)
    const room = new ChatRoom(this)

    this.nodes = [main, room]
    
    const path = location.pathname

    const mode = (path === '/chat') ? room : main

    this.navigate(mode.name)
  }

  static getNode = (nodeName) => {
    const index = this.nodes.findIndex(m => m.name === nodeName) // findIndex stops when found; find goes till the end
    return this.nodes[index]
  }

  static navigate(nodeName) {
    const node = this.getNode(nodeName)

    this.body.replaceChildren()
    this.body.append(node)

    node.render()

    if (nodeName === 'main') {
      node.userName.focus()
    } else {
      node._input.focus()
    }    
  }

  static reenter(nodeName) {
    // socket.emit('reenter')
    this.navigate(nodeName)
  }
}


App.init()



socket.on('rooms', (salas) => {
  App.getNode('main').updateRooms(salas)
})


socket.emit('arrival', {}, (error) => {
  if (error) {
    console.log('ERROR ON ARRIVAL: ', error)
    alert(error)
    const nextURL = location.origin + `/`
    const nextTitle = 'Chat Main'
    const nextState = {}
    window.history.pushState(nextState, nextTitle, nextURL)
    App.navigate('main')
  }
})



// window.onbeforeunload = (event) => {
//   const e = event || window.event;
//   // Cancel the event
//   e.preventDefault();
//   if (e) {
//     e.returnValue = ''; // Legacy method for cross browser support
//   }
//   return ''; // Legacy method for cross browser support
// };

