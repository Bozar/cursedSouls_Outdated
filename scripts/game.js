'use strict'

var Game = {}
Game.version = '0.0.1-dev'
Game._develop = true

Game.getDevelop = function () {
  return Game._develop ? Game._develop : false
}

Game.ui = {}

Game.ui.canvas = {}
Game.ui.canvas._width = 70
Game.ui.canvas._height = 25
Game.ui.canvas._fgColor = '#abb2bf'
Game.ui.canvas._bgColor = '#262626'
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
  fg: Game.ui.canvas._fgColor,
  bg: Game.ui.canvas._bgColor,
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

Game.test.switchKey = function (e) {
  if (e.key === ' ') {
    Game.test.screens.initial.exit()
    window.removeEventListener('keydown', Game.test.switchKey)
    console.log('exit inital screen')
    console.log('current screen name: ' + Game.test.screens.currentScreen)
  } else {
    console.log('key input: ' + e.key)
  }
}

// Screen prototype
Game.test.Screen = function (name) {
  this.name = name || null
}

Game.test.Screen.prototype.key = {}
Game.test.Screen.prototype.key.initial = function (e) {
  if (Game.getDevelop() && e.key === 'Escape') {
    console.log('Esc pressed.')
  }
}

Game.test.Screen.prototype.enter = function (draw) {
  Game.test.screens.currentScreen = this.name
  draw()
  window.addEventListener('keydown', this.key.initial)
}
Game.test.Screen.prototype.exit = function () {
  window.removeEventListener('keydown', this.key.initial)
  Game.display.clear()
  Game.test.screens.currentScreen = null
}

Game.test.screens = {}

Game.test.screens.currentScreen = null

Game.test.screens.initial = new Game.test.Screen('initial')
Game.test.screens.initial.draw = function () {
  // Game.test.screens.currentScreen = this.name

  let version = ''
  if (Game.getDevelop()) {
    version = 'Wiz|' + Game.version
  } else {
    version = Game.version
  }
  Game.display.drawText(70 - 0.5 - version.length, 0.5, version, '#619DD8')
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

  // window.addEventListener('keydown', Game.test.switchKey)
}

Game.test.screens.initial.key.explore = function (e) {
  // window.removeEventListener('keydown', Game.test.screens.initial.key.initial)

  if (e.key === 'l') {
    console.log('left')
  } else if (e.key === 'h') {
    console.log('right')
  } else if (e.key === 'Escape') {
      // return 'exit'
    window.removeEventListener('keydown', Game.test.screens.initial.key.explore)
    window.addEventListener('keydown', Game.test.screens.initial.key.initial)
    console.log('exit explore mode')
    //   console.log('bind new key')
      // window.addEventListener('keydown', initial.initial)
      // console.log('exit explore mode')
  } else {
    console.log('unknown input')
  }
}

Game.test.screens.initial.key.initial = function (e) {
  let initial = Game.test.screens.initial.key
  if (e.key === 'Escape') {
    Game.test.screens.initial.exit()
    if (Game.getDevelop()) {
      console.log('exit screen')
    }
  } else if (e.shiftKey) {
    if (e.key === 'X') {
      window.removeEventListener('keydown', initial.initial)

      console.log('enter explore mode')
      window.addEventListener('keydown', initial.explore)
    } else {
      console.log(e.key)
    }
  } else if (Game.getDevelop()) {
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

  console.log('before enter: ' + Game.test.screens.currentScreen)
  Game.test.screens.initial.enter(Game.test.screens.initial.draw)
  console.log('after enter: ' + Game.test.screens.currentScreen)
}
