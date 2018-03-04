'use strict'

var Game = {}
Game._version = '0.0.1-dev'
Game._develop = true
Game.getVersion = function () { return Game._version }
Game.getDevelop = function () { return Game._develop }

Game._seed = null
// Game._seed = '#helloWorld'
// Game._seed = '#12345'
Game.setSeed = function (seed) {
  // set a testing seed (beginning with '#') in game.js
  if (this._seed && this._seed.match(/^#/)) { return }

  if (seed && seed.match(/^[a-zA-z]+$/)) {
    this._seed = seed
  } else if (seed === '') {
    this._seed =
      Math.floor((Math.random() * 9 + 1) * Math.pow(10, 4)).toString()
  }
}
Game.getSeed = function () { return Game._seed }

Game.feedRNG = function () {
  let seedList = str2List()
  let randNumber = []

  seedList
    ? (function () {
      ROT.RNG.setSeed(list2Number())
      for (let i = 0; i < 10; i++) { randNumber.push(ROT.RNG.getUniform()) }

      Game.getDevelop() && console.log('RNG start: ' +
        JSON.stringify(randNumber, null, 2))
    }())
    : Game.getDevelop() && console.log(Game.text.dev('seed'))

  function str2List () {
    let seed = Game.getSeed()

    // use random number as seed
    if (Number.isInteger(Number.parseInt(seed, 10))) {
      return [seed]
    }

    if (seed.match(/^#/)) {
      seed = seed.slice(1)
    }
    if (seed.match(/^[a-zA-z]+$/)) {
      seed = seed.toLowerCase().split('')
      seed.forEach((aplhabet, index, seedList) => {
        seedList[index] = aplhabet.charCodeAt(0) - 95
      })
    }

    return Array.isArray(seed) ? seed : null   // invalid seed
  }

  function list2Number () {
    let rngSeed = 1
    for (let i = 0; i < seedList.length; i++) {
      rngSeed.length < 16 ? rngSeed *= seedList[i] : rngSeed /= seedList[i]
    }
    return rngSeed
  }
}

Game.UI = function (width, height, top, right, bottom, left) {
  this._width = width || null
  this._height = height || null
  this._padTop = top || null
  this._padRight = right || null
  this._padBottom = bottom || null
  this._padLeft = left || null

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

Game.display = new ROT.Display({
  width: Game.UI.canvas.getWidth(),
  height: Game.UI.canvas.getHeight(),
  fg: '#abb2bf',
  bg: '#262626',
  fontSize: 20,
  fontFamily: (function () {
    let family = 'dejavu sans mono'
    family += ', consolas'
    family += ', monospace'

    return family
  }())
})

// TODO: ?? Nethack Fourk, auto-resize canvas to fit the browser window
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

Game.UI.start = new Game.UI(Game.UI.canvas.getWidth() - 10,
  Game.UI.dungeon.getBoxHeight() + Game.UI.message.getBoxHeight())

Game.UI.start._x = 5
Game.UI.start._y = Game.UI.dungeon.getY()

Game.UI.inputSeed = new Game.UI(Game.UI.start.getWidth(), 1)
Game.UI.inputSeed._x = Game.UI.start.getX()
Game.UI.inputSeed._y = Game.UI.start.getY() + 15

Game.keyboard = {}
Game.keyboard.bindMap = new Map()
// [mode1: [keybind1], mode2: [keybind2], ...]
// keybind1 -> [action1: [key1_1, key1_2, ...],
//              action2: [key2_1, key2_2, ...], ...]

Game.keyboard.bindMap.set('move', new Map([
  ['left', ['h', 'ArrowLeft']], ['down', ['j', 'ArrowDown']],
  ['up', ['k', 'ArrowUp']], ['right', ['l', 'ArrowRight']],
  ['upLeft', ['y']], ['upRight', ['u']],
  ['downLeft', ['b']], ['downRight', ['n']]
]))

Game.keyboard.getAction = function (keyInput, mode, bindMap) {
  if (!mode) {
    Game.getDevelop() && console.log(Game.text.dev('mode'))
    return null
  }
  let bindings = bindMap || Game.keyboard.bindMap

  for (const [key, value] of bindings.get(mode)) {
    return value.indexOf(keyInput.key) > -1 ? key : null
  }
}

Game.keyboard.listenEvent = function (event, handler) {
  switch (event) {
    case 'add':
      window.addEventListener('keydown', handler)
      break
    case 'remove':
      window.removeEventListener('keydown', handler)
      break
  }
}

Game.Screen = function (name, mode) {
  this._name = name || 'Unnamed Screen'
  this._mode = mode || 'main'
}

Game.Screen.prototype.getName = function () { return this._name }
Game.Screen.prototype.getMode = function () { return this._mode }
Game.Screen.prototype.setMode = function (mode) { this._mode = mode || 'main' }

Game.Screen.prototype.enter = function () {
  Game.screens._currentName = this.getName()
  Game.screens._currentMode = this.getMode()

  Game.screens.drawVersion()
  // do not show seed in the first screen
  Game.screens._currentName !== 'classSeed' && Game.screens.drawSeed()
  this.display()
}

Game.Screen.prototype.exit = function () {
  Game.screens._currentName = null
  Game.screens._currentMode = null

  Game.display.clear()
}

Game.Screen.prototype.display = function () {
  Game.display.drawText(1, 1, 'Testing screen')
  Game.display.drawText(1, 2, 'Name: ' + Game.screens._currentName)
  Game.display.drawText(1, 3, 'Mode: ' + Game.screens._currentMode)
}

Game.Screen.prototype.keyInput = function (e) {
  Game.getDevelop() && console.log('Key pressed: ' + e.key)
}

Game.screens = {}
Game.screens._currentName = null
Game.screens._currentMode = null

// general version
// Game.screens.clearBlock = function (x, y, width, height, fillText) {
//   for (let i = x; i < x + width; i++) {
//     for (let j = y; j < y + height; j++) {
//       Game.display.draw(i, j, fillText || null)  // blank by default
//     }
//   }
// }

Game.screens.clearBlock = function (block, fillText) {
  let x = block.getX()
  let y = block.getY()

  for (let i = x; i < x + block.getWidth(); i++) {
    for (let j = y; j < y + block.getHeight(); j++) {
      // blank by default
      Game.display.draw(i, j, fillText || null)
    }
  }
}

Game.screens.drawVersion = function () {
  let version = Game.getVersion()

  Game.getDevelop() && (version = 'Wizard|' + version)
  Game.display.drawText(
    Game.UI.stat.getX() + Game.UI.stat.getWidth() - version.length,
    Game.UI.stat.getY(),
    version)
}

Game.screens.drawSeed = function () {
  if (!Game.getSeed()) { return }

  Game.display.drawText(
    Game.UI.stat.getX() + Game.UI.stat.getWidth() - Game.getSeed().length,
    Game.UI.stat.getY() + Game.UI.stat.getHeight() - 1,
    Game.getSeed())
}

Game.screens.drawModeLine = function (text) {
  Game.display.drawText(Game.UI.modeLine.getX(), Game.UI.modeLine.getY(), text)
}

Game.screens.classSeed = new Game.Screen('classSeed')
Game.screens.classSeed.display = function () {
  let x = Game.UI.start.getX()
  let y = Game.UI.start.getY()
  let width = Game.UI.start.getWidth()

  Game.display.drawText(x, y, Game.text.selectClass(), width)
  Game.screens.drawModeLine(Game.text.modeLine('select'))
}

Game.screens.classSeed.keyInput = function (e) {
  let x = Game.UI.start.getX()
  let y = Game.UI.start.getY() + 7
  let seedList = []       // store in Game._seed
  let seedString = []     // draw on the canvas

  if (e.key.match(/^[a|b|c]$/)) {
    switch (e.key) {
      case 'a':
        Game.test.store.PC = 'dio'
        break
      case 'b':
        Game.test.store.PC = 'hulk'
        break
      case 'c':
        Game.test.store.PC = 'lasombra'
        break
    }
    Game.keyboard.listenEvent('remove', Game.screens.classSeed.keyInput)

    Game.screens.clearBlock(Game.UI.modeLine)
    Game.display.drawText(x, y, Game.text.selectClass(Game.test.store.PC))
    Game.display.drawText(x, y + 3, Game.text.describeSeed())
    Game.screens.drawModeLine(Game.text.modeLine('enter') +
      Game.text.modeLine('backspace'))

    Game.keyboard.listenEvent('add', verifySeed)
  }

  function verifySeed (e) {
    if (e.key.match(/^[a-zA-Z]$/) && seedList.length < 16) {
      seedList.push(e.key)
      drawSeed()
    } else if (e.key === 'Backspace' && seedList.length > 0) {
      seedList = seedList.slice(0, seedList.length - 1)
      drawSeed()
    } else if (e.key === 'Enter') {
      Game.setSeed(seedList.join(''))
      Game.keyboard.listenEvent('remove', verifySeed)

      Game.screens.clearBlock(Game.UI.modeLine)
      Game.display.drawText(x, y + 10, Game.text.confirmDecision())
      Game.screens.drawModeLine(Game.text.modeLine('yesNoLower'))

      Game.keyboard.listenEvent('add', confirm)
    }
  }

  function confirm (e) {
    switch (e.key) {
      case 'y':
        Game.keyboard.listenEvent('remove', confirm)

        Game.screens.classSeed.exit()
        Game.screens.prologue.enter()
        Game.feedRNG()

        Game.keyboard.listenEvent('add', Game.screens.prologue.keyInput)
        break
      case 'n':
        Game.keyboard.listenEvent('remove', confirm)

        if (!(Game.getSeed() && Game.getSeed().match(/^#/))) {
          // do not overwrite internal seed: '#1234567', '#abcdefg', etc.
          Game.setSeed(null)
        }
        Game.test.store.PC = null

        Game.screens.classSeed.exit()
        Game.screens.classSeed.enter()

        Game.keyboard.listenEvent('add', Game.screens.classSeed.keyInput)
        break
    }
  }

  function drawSeed () {
    seedString = seedList.join('')
    while (seedString.length < 16) { seedString += ' ' }
    seedString = '[' + seedString + ']'

    Game.screens.clearBlock(Game.UI.inputSeed)
    Game.display.drawText(x, y + 8, seedString)
  }
}

Game.screens.prologue = new Game.Screen('prologue')
Game.screens.prologue.display = function () {
  Game.display.drawText(Game.UI.start.getX(), Game.UI.start.getY(),
    Game.text.prologue(Game.test.store.PC), Game.UI.start.getWidth())
}

Game.screens.prologue.keyInput = function (e) {
  if (e.key === ' ') {
    console.log('switch screen')
  } else if (e.shiftKey) {
    if (e.key === 'Y') {
      console.log('Yes pressed')
    } else {
      console.log('not Yes ' + e.key)
    }
  }
}

// ===== Test =====
Game.test = {}
Game.test.upper = function (text) {
  return text.toUpperCase()
}

Game.test.store = {}
Game.test.store.PC = null

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
      Game.UI.message.getX(),
      // Game.UI.message.getPadLeft(),     // x
      Game.UI.message.getY() + i,
      // Game.UI.canvas.getHeight() -
      // Game.UI.modeLine.getBoxHeight() - Game.UI.message.getBoxHeight() +
      // Game.UI.message.getPadTop() + i,  // y
      msgList[i],
      Game.UI.message.getWidth())
  }
}

// ===== Test End =====

window.onload = function () {
  if (!ROT.isSupported()) {
    window.alert(Game.text.dev('browser'))
    return
  }
  document.getElementById('game').appendChild(Game.display.getContainer())

  Game.screens.classSeed.enter()
  Game.keyboard.listenEvent('add', Game.screens.classSeed.keyInput)
}