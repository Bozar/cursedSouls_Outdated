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

  this._x = null
  this._y = null
}

Game.UI.prototype.getWidth = function () { return this._width }
Game.UI.prototype.getHeight = function () { return this._height }
Game.UI.prototype.getPadTop = function () { return this._padTop }
Game.UI.prototype.getPadRight = function () { return this._padRight }
Game.UI.prototype.getPadBottom = function () { return this._padBottom }
Game.UI.prototype.getPadLeft = function () { return this._padLeft }
Game.UI.prototype.getX = function () { return this._x }
Game.UI.prototype.getY = function () { return this._y }

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

// | Spell    (2) | Stat |
// | Dungeon  (?) | Stat |
// | Message  (5) | Stat |
// | Modeline (1) | Stat |
Game.UI.stat = new Game.UI(15, null, 0.5, 1, 0.5, 0)
Game.UI.stat._height = Game.UI.canvas.getHeight() -
  Game.UI.stat.getPadTop() - Game.UI.stat.getPadBottom()

Game.UI.stat._x = Game.UI.canvas.getWidth() -
  Game.UI.stat.getPadRight() - Game.UI.stat.getWidth()
Game.UI.stat._y = Game.UI.stat.getPadTop()

Game.UI.modeLine = new Game.UI(null, 1, 0, 0, Game.UI.stat.getPadBottom(), 1)
Game.UI.modeLine._width = Game.UI.canvas.getWidth() -
  Game.UI.modeLine.getPadLeft() - Game.UI.modeLine.getPadRight() -
  Game.UI.stat.getBoxWidth()

Game.UI.modeLine._x = Game.UI.modeLine.getPadLeft()
Game.UI.modeLine._y = Game.UI.canvas.getHeight() -
  Game.UI.modeLine.getPadBottom() - Game.UI.modeLine.getHeight()

Game.UI.spell = new Game.UI(Game.UI.modeLine.getWidth(), 2,
  Game.UI.stat.getPadTop(), 0, 0, Game.UI.modeLine.getPadLeft())

Game.UI.spell._x = Game.UI.modeLine.getX()
Game.UI.spell._y = Game.UI.stat.getY()

Game.UI.message = new Game.UI(Game.UI.modeLine.getWidth(), 5,
  0, 0, 0, Game.UI.modeLine.getPadLeft())
// TODO: ?? Nethack Fourk, auto-resize canvas to fit the browser window

Game.UI.message._x = Game.UI.modeLine.getX()
Game.UI.message._y = Game.UI.canvas.getHeight() -
  Game.UI.modeLine.getBoxHeight() -
  Game.UI.message.getPadBottom() - Game.UI.message.getHeight()

Game.UI.dungeon = new Game.UI(Game.UI.modeLine.getWidth(),
  Game.UI.canvas.getHeight() -
  Game.UI.spell.getBoxHeight() -
  Game.UI.message.getBoxHeight() - Game.UI.modeLine.getBoxHeight(),
  0, 0, 0, Game.UI.modeLine.getPadLeft())

Game.UI.dungeon._x = Game.UI.modeLine.getX()
Game.UI.dungeon._y = Game.UI.spell.getBoxHeight() + Game.UI.dungeon.getPadTop()

Game.UI.key = {}
Game.UI.key.bindings = new Map()
// [mode1: [keybind1], mode2: [keybind2], ...]
// keybind1 -> [action1: [key1_1, key1_2, ...],
//              action2: [key2_1, key2_2, ...], ...]
Game.UI.key.bindings.set('decide', new Map([
  ['yes', ['y']], ['Yes', ['Y']], ['no', ['n']], ['No', ['N']],
  ['space', [' ']], ['enter', ['Enter']], ['escape', ['Escape']],
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
Game.Screen.prototype.setMode = function (mode) { this._mode = mode || 'main' }

// Screen.key.init()            <-- overwrite this when necessary
// Screen.key.lookAround()      <-- keybindings for different modes
// Screen.key.inventoryMenu()   <-- ... and menus
Game.Screen.prototype.key = {}
Game.Screen.prototype.key.init = function (e) {
  if (Game.getDevelop()) {
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
Game.screens.draw.version = function (version) {
  if (Game.getDevelop()) {
    version = 'Wizard|' + version
  }
  Game.display.drawText(
    Game.UI.stat.getX() + Game.UI.stat.getWidth() - version.length,
    Game.UI.stat.getY(),
    version)
}

Game.screens.draw.seed = function (seed) {
  Game.UI.modeLine.getPadTop()
  Game.display.drawText(
    Game.UI.stat.getX() + Game.UI.stat.getWidth() - seed.length,
    Game.UI.stat.getY() + Game.UI.stat.getHeight() - 1,
    seed)
}

Game.screens.draw.modeLine = function (text) {
  Game.display.drawText(Game.UI.modeLine.getX(), Game.UI.modeLine.getY(), text)
}

Game.screens.prologue = new Game.Screen('prologue')
Game.screens.prologue.display = function () {
  Game.screens.draw.version(Game.version)
  Game.screens.draw.seed('helloWorld')

  Game.display.drawText(5, Game.UI.dungeon.getY(),
    Game.text.prologue(Game.test.PC), Game.UI.canvas.getWidth() - 10)
}

Game.screens.prologue.key.init = function (e) {
  if (Game.UI.key.check(e, 'decide') === 'space') {
    console.log('switch screen')
  }
}

// ===== Test =====
Game.test = {}
Game.test.upper = function (text) {
  return text.toUpperCase()
}

Game.test.PC = 'chooseA'

// TODO: move the methods of UI.message to somewhere else
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
      Game.UI.message.getX(),     // x
      // Game.UI.message.getPadLeft(),     // x
      Game.UI.message.getY() + i,
      // Game.UI.canvas.getHeight() -
      // Game.UI.modeLine.getBoxHeight() - Game.UI.message.getBoxHeight() +
      // Game.UI.message.getPadTop() + i,  // y
      msgList[i],
      Game.UI.message.getWidth())
  }
}

// Game.screens.welcome = new Game.Screen('welcome')

// Game.screens.welcome.drawScreen = function () {
//   Game.screens.draw.version(Game.version)
//   Game.screens.draw.seed('helloWorld')

//   Game.display.drawText(5, 3, '1234567890', '#619DD8')
//   Game.display.draw(5, 4, '@', '#619DD8', 'red')
//   Game.display.drawText(5, 5, '%c{green}hello%c{} world,')
//   Game.display.drawText(5, 6,
//     `%c{yellow}%b{grey}great%b{} ${Game.test.upper('hero')}%c{}!`, 6)

//   Game.display.drawText(1, Game.UI.canvas._height - 8.5, '—')
//   Game.display.drawText(1, Game.UI.canvas._height - 7.5, 'top')
//   Game.display.drawText(4, Game.UI.canvas._height - 7.5, '|hi')
//   Game.screens.draw.modeLine('Press space to continue, esc to skip')
//   // Game.display.drawText(1, Game.UI.canvas._height - 1.5, 'bottom')
//   Game.UI.message.add('123456789')
//   Game.UI.message.add('1234567890#')
//   Game.UI.message.add('12345678901#')
//   Game.UI.message.add('123456789012#')
//   Game.UI.message.add('1234567890123#')
//   Game.UI.message.add('12345678901234567890123456789012345678901234567890#')
//   Game.UI.message.print()
// }

// Game.screens.welcome.key.init = function (e) {
//   let welcome = Game.screens.welcome

//   if (Game.UI.key.check(e, 'decide') === 'cancel') {
//     // if (e.key === 'Escape') {
//     Game.screens.welcome.exit()
//     if (Game.getDevelop()) {
//       console.log('exit screen')
//     }
//   } else if (e.shiftKey) {
//     if (e.key === 'X') {
//       window.removeEventListener('keydown', welcome.key.init)
//       console.log('enter explore mode')
//       window.addEventListener('keydown', welcome.key.explore)
//     } else {
//       console.log(e.key)
//     }
//   } else if (e.key === '=') {
//     console.log(welcome._name)
//     console.log(welcome._mode)
//   } else if (Game.getDevelop()) {
//     console.log(e.key)
//   }
// }

// Game.screens.welcome.key.explore = function (e) {
//   let welcome = Game.screens.welcome
//   welcome.setMode('explore')
//   Game.screens.currentScreen._mode = welcome.getMode()

//   if (Game.UI.key.check(e, 'move') === 'left') {
//     console.log('left')
//   } else if (Game.UI.key.check(e, 'move') === 'right') {
//     console.log('right')
//   } else if (e.key === '=') {
//     console.log(Game.screens.currentScreen._name)
//     console.log(Game.screens.currentScreen._mode)
//   } else if (Game.UI.key.check(e, 'decide') === 'cancel') {
//     window.removeEventListener('keydown', welcome.key.explore)
//     window.addEventListener('keydown', welcome.key.init)
//     console.log('exit explore mode')
//   } else {
//     console.log('unknown input')
//   }
//   welcome.setMode()
// }
// ===== Test End =====

window.onload = function () {
  if (!ROT.isSupported()) {
    window.alert('Rot.js is not supported by your browser.')
    return
  }
  document.getElementById('game').appendChild(Game.display.getContainer())

  Game.screens.prologue.enter(Game.screens.prologue.display)
  Game.screens.draw.modeLine('Press Space to continue')
}
