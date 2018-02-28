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

Game.Screen = function (name, mode) {
  this._name = name || 'Unnamed Screen'
  this._mode = mode || 'main'
}

Game.Screen.prototype.getName = function () { return this._name }
Game.Screen.prototype.getMode = function () { return this._mode }
Game.Screen.prototype.setMode = function (mode) {
  this._mode = mode || 'main'
}

// Screen.key.init()            <-- overwrite this when necessary
// Screen.key.lookAround()      <-- keybindings for different modes
// Screen.key.inventoryMenu()   <-- ... and menus
Game.Screen.prototype.key = {}
Game.Screen.prototype.key.init = function (e) {
  if (Game.getDevelop()) {
    console.log('Press Esc to test keybinding')
    if (e.key === 'Escape') {
      console.log('Esc pressed')
    } else {
      console.log('Key: ' + e.key)
    }
  }
}

Game.Screen.prototype.enter = function (display) {
  Game.screens.currentScreen._name = this.getName()
  Game.screens.currentScreen._mode = this.getMode()

  display()
  window.addEventListener('keydown', this.key.init)
}

Game.Screen.prototype.exit = function () {
  Game.screens.currentScreen._name = null
  Game.screens.currentScreen._mode = null

  Game.display.clear()
  window.removeEventListener('keydown', this.key.init)
}

Game.screens = {}

Game.screens.currentScreen = {}
Game.screens.currentScreen._name = null
Game.screens.currentScreen._mode = null

Game.screens.welcome = new Game.Screen('welcome')

Game.screens.welcome.drawScreen = function () {
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
}

Game.screens.welcome.key.init = function (e) {
  let welcome = Game.screens.welcome

  if (e.key === 'Escape') {
    Game.screens.welcome.exit()
    if (Game.getDevelop()) {
      console.log('exit screen')
    }
  } else if (e.shiftKey) {
    if (e.key === 'X') {
      window.removeEventListener('keydown', welcome.key.init)
      console.log('enter explore mode')
      window.addEventListener('keydown', welcome.key.explore)
    } else {
      console.log(e.key)
    }
  } else if (e.key === '=') {
    console.log(welcome._name)
    console.log(welcome._mode)
  } else if (Game.getDevelop()) {
    console.log(e.key)
  }
}

Game.screens.welcome.key.explore = function (e) {
  let welcome = Game.screens.welcome
  welcome.setMode('explore')
  Game.screens.currentScreen._mode = welcome.getMode()

  if (e.key === 'l') {
    console.log('left')
  } else if (e.key === 'h') {
    console.log('right')
  } else if (e.key === '=') {
    console.log(Game.screens.currentScreen._name)
    console.log(Game.screens.currentScreen._mode)
  } else if (e.key === 'Escape') {
    window.removeEventListener('keydown', welcome.key.explore)
    window.addEventListener('keydown', welcome.key.init)
    console.log('exit explore mode')
  } else {
    console.log('unknown input')
  }
  welcome.setMode()
}

// ===== Test =====
Game.test = {}
Game.test.upper = function (text) {
  return text.toUpperCase()
}

// ===== Test End =====

window.onload = function () {
  if (!ROT.isSupported()) {
    window.alert('Rot.js is not supported by your browser.')
    return
  }
  document.getElementById('game').appendChild(Game.display.getContainer())

  Game.screens.welcome.enter(Game.screens.welcome.drawScreen)
}
