'use strict'

var Game = {}
Game.version = '0.0.1-dev'
Game._develop = true
Game.getDevelop = function () { return Game._develop || false }

Game.UI = function (width, height, top, right, bottom, left) {
  this._width = width
  this._height = height
  this._padTop = top
  this._padRight = right
  this._padBottom = bottom
  this._padLeft = left
}

Game.UI.prototype.getWidth = function () { return this._width }
Game.UI.prototype.getHeight = function () { return this._height }
Game.UI.prototype.getPadTop = function () { return this._padTop }
Game.UI.prototype.getPadRight = function () { return this._padRight }
Game.UI.prototype.getPadBottom = function () { return this._padBottom }
Game.UI.prototype.getPadLeft = function () { return this._padLeft }

Game.UI.prototype.getPadHorizonal = function () {
  return this._padLeft + this._padRight
}
Game.UI.prototype.getPadVertical = function () {
  return this._padTop + this._padBottom
}
Game.UI.prototype.getBoxWidth = function () {
  return this._width + this._padLeft + this._padRight
}
Game.UI.prototype.getBoxHeight = function () {
  return this._height + this._padTop + this._padBottom
}

Game.UI.canvas = new Game.UI(70, 25)
Game.UI.canvas._fgColor = '#abb2bf'
Game.UI.canvas._bgColor = '#262626'
Game.UI.canvas._fontSize = 20
Game.UI.canvas._fontFamily = 'dejavu sans mono'
Game.UI.canvas._fontFamily += ', consolas'
Game.UI.canvas._fontFamily += ', monospace'

Game.UI.stat = new Game.UI(20, null, 0.5, 0.5, 0.5, 0)
Game.UI.stat._height =
  Game.UI.canvas.getHeight() - Game.UI.stat.getPadVertical()

Game.UI.modeLine = new Game.UI(null, 1, 0, 0, 0.5, 1)
Game.UI.modeLine._width =
  Game.UI.canvas.getWidth() - Game.UI.modeLine.getPadHorizonal() -
  Game.UI.stat.getBoxWidth()

Game.UI.message = new Game.UI(Game.UI.modeLine.getWidth(), 5,
  0.5, Game.UI.modeLine.getPadRight(),
  0, Game.UI.modeLine.getPadLeft())
// TODO: auto-resize canvas to fit the browser window?

Game.UI.message._msgList = (function () {
  let emptyList = new Array(Game.UI.message.getHeight())
  for (let i = 0; i < emptyList.length; i++) {
    emptyList[i] = ''
  }
  return emptyList
}())

Game.UI.message.add = function (msg) {
  let updatedMsg = Game.UI.message._msgList.slice(
    Math.ceil(msg.length / Game.UI.message.getWidth()))

  updatedMsg.push(msg)
  Game.UI.message._msgList = updatedMsg
}

Game.UI.message.print = function () {
  let msgList = Game.UI.message._msgList

  for (let i = 0; i < msgList.length; i++) {
    Game.display.drawText(
      Game.UI.message.getPadLeft(),     // x
      Game.UI.canvas.getHeight() -
      Game.UI.modeLine.getBoxHeight() - Game.UI.message.getBoxHeight() +
      Game.UI.message.getPadTop() + i,  // y
      msgList[i],
      Game.UI.message.getWidth())
  }
}

Game.UI.key = {}
Game.UI.key.bindings = new Map()
// [mode1: [keybind1], mode2: [keybind2], ...]
// keybind1 -> [action1: [key1_1, key1_2, ...],
//              action2: [key2_1, key2_2, ...], ...]
Game.UI.key.bindings.set('decide', new Map([
  ['yes', ['y']], ['Yes', ['Y']], ['no', ['n']], ['No', ['N']],
  ['continue', [' ', 'Enter']], ['cancel', ['Escape']],
  ['chooseA', ['a', 'A']], ['chooseB', ['b', 'B']], ['chooseC', ['c', 'C']]
]))

Game.UI.key.bindings.set('move', new Map([
  ['left', ['h', 'ArrowLeft']], ['down', ['j', 'ArrowDown']],
  ['up', ['k', 'ArrowUp']], ['right', ['l', 'ArrowRight']],
  ['upLeft', ['y']], ['upRight', ['u']],
  ['downLeft', ['b']], ['downRight', ['n']]
]))

Game.UI.key.check = function (keyboardInput, mode, bindMap) {
  let bindings = bindMap || Game.UI.key.bindings

  for (const [key, value] of bindings.get(mode)) {
    if (value.indexOf(keyboardInput.key) > -1) {
      return key
    }
  }
  return null
}

Game.display = new ROT.Display({
  width: Game.UI.canvas._width,
  height: Game.UI.canvas._height,
  fg: Game.UI.canvas._fgColor,
  bg: Game.UI.canvas._bgColor,
  fontSize: Game.UI.canvas._fontSize,
  fontFamily: Game.UI.canvas._fontFamily
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

Game.screens.draw = {}
Game.screens.draw.version = function () {
  let version = ''
  if (Game.getDevelop()) {
    version = 'Wiz|' + Game.version
  } else {
    version = Game.version
  }
  Game.display.drawText(
    Game.UI.canvas.getWidth() - Game.UI.stat.getPadRight() - version.length,
    Game.UI.stat.getPadTop(),
    version)
}

Game.screens.draw.bottom = function (text) {
  Game.display.drawText(
    Game.UI.modeLine.getPadLeft(),
    Game.UI.canvas.getHeight() - Game.UI.modeLine.getBoxHeight() +
    Game.UI.modeLine.getPadTop(),
    text)
}

Game.screens.welcome = new Game.Screen('welcome')

Game.screens.welcome.drawScreen = function () {
  Game.screens.draw.version()
  Game.display.drawText(5, 3, '1234567890', '#619DD8')
  Game.display.draw(5, 4, '@', '#619DD8', 'red')
  Game.display.drawText(5, 5, '%c{green}hello%c{} world,')
  Game.display.drawText(5, 6,
    `%c{yellow}%b{grey}great%b{} ${Game.test.upper('hero')}%c{}!`, 6)

  Game.display.drawText(1, Game.UI.canvas._height - 8.5, '—')
  Game.display.drawText(1, Game.UI.canvas._height - 7.5, 'top')
  Game.display.drawText(4, Game.UI.canvas._height - 7.5, '|hi')
  Game.screens.draw.bottom('Press space to continue, esc to skip')
  // Game.display.drawText(1, Game.UI.canvas._height - 1.5, 'bottom')
  Game.UI.message.add('123456789')
  Game.UI.message.add('1234567890#')
  Game.UI.message.add('12345678901#')
  Game.UI.message.add('123456789012#')
  Game.UI.message.add('1234567890123#')
  Game.UI.message.add('12345678901234567890123456789012345678901234567890#')
  Game.UI.message.print()
}

Game.screens.welcome.key.init = function (e) {
  let welcome = Game.screens.welcome

  if (Game.UI.key.check(e, 'decide') === 'cancel') {
    // if (e.key === 'Escape') {
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

  if (Game.UI.key.check(e, 'move') === 'left') {
    console.log('left')
  } else if (Game.UI.key.check(e, 'move') === 'right') {
    console.log('right')
  } else if (e.key === '=') {
    console.log(Game.screens.currentScreen._name)
    console.log(Game.screens.currentScreen._mode)
  } else if (Game.UI.key.check(e, 'decide') === 'cancel') {
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
