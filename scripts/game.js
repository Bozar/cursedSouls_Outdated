'use strict'

var Game = {}
Game.version = '0.0.1-dev'

Game.ui = {}

Game.ui.canvas = {}
Game.ui.canvas._width = 70
Game.ui.canvas._height = 25
Game.ui.canvas._fontSize = 20
Game.ui.canvas._fontFamily = 'dejavu sans mono'
Game.ui.canvas._fontFamily += ', consolas'
Game.ui.canvas._fontFamily += ', monospace'

Game.ui.stat = {}
Game.ui.stat._width = 20

Game.ui.message = {}
// TODO: auto-resize canvas to fit the browser window?

// left -> right: 1 | message | 1 | stat | 1
// top -> down: 0.5 | ??? | map | 1 | message | keyHint | 0.5
Game.ui.message._width = Game.ui.canvas._width - Game.ui.stat._width - 3
Game.ui.message._height = 5
Game.ui.message._msgList = (function () {
  let emptyList = new Array(Game.ui.message._height)
  for (let i = 0; i < emptyList.length; i++) {
    emptyList[i] = ''
  }
  return emptyList
}())

Game.ui.message.add = function (msg) {
  let updatedMsg = Game.ui.message._msgList.slice(
    Math.ceil(msg.length / Game.ui.message._width))

  updatedMsg.push(msg)
  Game.ui.message._msgList = updatedMsg
}

Game.ui.message.print = function () {
  let msgList = Game.ui.message._msgList

  for (let i = 0; i < msgList.length; i++) {
    Game.display.drawText(
      1,
      Game.ui.canvas._height - Game.ui.message._height - 1.5 + i,
      msgList[i],
      Game.ui.message._width)
  }
}

Game.display = new ROT.Display({
  width: Game.ui.canvas._width,
  height: Game.ui.canvas._height,
  fontSize: Game.ui.canvas._fontSize,
  fontFamily: Game.ui.canvas._fontFamily
})

// ===== Test =====
Game.test = {}
Game.test.upper = function (text) {
  return text.toUpperCase()
}

Game.test.showKey = function (e) {
  Game.display.clear()
  if (e.key === 'Escape') {
    // window.removeEventListener('keyup', Game.test.showKey)
    window.removeEventListener('keydown', Game.test.showKey)
    Game.display.drawText(1, 1, 'stop listening')
    console.log('no longer listen keyboard input')
  } else if (e.shiftKey) {
    if (e.key === 'S') {
      Game.display.drawText(1, 1, '!!!S')
      console.log('shift s')
    } else {
      Game.display.drawText(1, 1, e.key)
      console.log('shift only')
    }
  } else if (e.altKey) {
    if (e.key === 's') {
      Game.display.drawText(1, 1, '!!!alt: s')
      console.log('alt: ' + e.key)
    } else {
      Game.display.drawText(1, 1, 'alt: ' + e.key)
      console.log('alt only')
    }
  } else {
    Game.display.draw(1, 1, e.key)
    console.log(e.key)
  }
}

// ===== Test End =====

window.onload = function () {
  if (!ROT.isSupported()) {
    window.alert('Rot.js is not supported by your browser.')
    return
  }
  document.getElementById('game').appendChild(Game.display.getContainer())

  // window.addEventListener('keyup', Game.test.showKey)
  window.addEventListener('keydown', Game.test.showKey)

  Game.display.drawText(70 - 0.5 - Game.version.length, 0.5, Game.version, '#619DD8')
  Game.display.drawText(5, 3, '1234567890', '#619DD8')
  Game.display.draw(5, 4, '@', '#619DD8', 'red')
  Game.display.drawText(5, 5, '%c{green}hello%c{} world,')
  Game.display.drawText(5, 6,
    `%c{yellow}%b{grey}great%b{} ${Game.test.upper('hero')}%c{}!`, 6)

  Game.display.drawText(1, Game.ui.canvas._height - 8.5, '—')
  Game.display.drawText(1, Game.ui.canvas._height - 7.5, 'top')
  Game.display.drawText(4, Game.ui.canvas._height - 7.5, '|hi')
  Game.display.drawText(1, Game.ui.canvas._height - 1.5, 'bottom')
  Game.ui.message.add('123456789')
  Game.ui.message.add('1234567890#')
  Game.ui.message.add('12345678901#')
  Game.ui.message.add('123456789012#')
  Game.ui.message.add('1234567890123#')
  Game.ui.message.add('12345678901234567890123456789012345678901234567890#')
  Game.ui.message.print()
}
