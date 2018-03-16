'use strict'

// ----- Version number, development switch, seed & color +++++
var Game = {}
Game._version = '0.0.1-dev'
Game._develop = true
Game.getVersion = function () { return Game._version }
Game.getDevelop = function () { return Game._develop }

Game._dungeonSize = [55, 20]   // [width, height]

// set seed manually for testing
// Game._devSeed = '#finn'
// Game._devSeed = '#12345'

Game._color = new Map()
Game._color.set(null, '')
Game._color.set('white', '#ABB2BF')
Game._color.set('black', '#262626')
Game._color.set('grey', '#666666')
Game._color.set('orange', '#FF9900')
Game._color.set('green', '#A0D86C')
Game._color.set('yellow', '#FFE272')
Game._color.set('red', '#FF4C4C')

Game.getColor = function (color) { return Game._color.get(color) }

// ----- The position & size of screen elements +++++
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

Game.UI.canvas = new Game.UI(70, 26)

Game.display = new ROT.Display({
  width: Game.UI.canvas.getWidth(),
  height: Game.UI.canvas.getHeight(),
  fg: Game.getColor('white'),
  bg: Game.getColor('black'),
  fontSize: 20,
  fontFamily: (function () {
    let family = 'dejavu sans mono'
    family += ', consolas'
    family += ', monospace'

    return family
  }())
})

// ``` The main screen +++
// TODO: ?? Nethack Fourk, auto-resize canvas to fit the browser window
// | Spell    (2) | Stat |
// | Dungeon  (?) | Stat |
// | Message  (5) | Stat |
// | Modeline (1) | Stat |
Game.UI.stat = new Game.UI(15, null, 0.5, 1, 0.5, 1)
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
  Game.UI.stat.getPadTop(), 0, 1, Game.UI.modeLine.getPadLeft())

Game.UI.spell._x = Game.UI.modeLine.getX()
Game.UI.spell._y = Game.UI.stat.getY()

Game.UI.message = new Game.UI(Game.UI.modeLine.getWidth(), 5,
  1, 0, 0, Game.UI.modeLine.getPadLeft())

Game.UI.message._x = Game.UI.modeLine.getX()
Game.UI.message._y = Game.UI.canvas.getHeight() -
  Game.UI.modeLine.getBoxHeight() -
  Game.UI.message.getPadBottom() - Game.UI.message.getHeight()

Game.UI.dungeon = new Game.UI(Game.UI.modeLine.getWidth(),
  Game.UI.canvas.getHeight() - Game.UI.spell.getBoxHeight() -
  Game.UI.message.getBoxHeight() - Game.UI.modeLine.getBoxHeight(),
  0, 0, 0, Game.UI.modeLine.getPadLeft())

Game.UI.dungeon._x = Game.UI.modeLine.getX()
Game.UI.dungeon._y = Game.UI.spell.getBoxHeight() + Game.UI.dungeon.getPadTop()

// ``` Sub screens +++
Game.UI.column1 = new Game.UI()
Object.assign(Game.UI.column1, Game.UI.spell)
Game.UI.column1._width = 22

Game.UI.column2 = new Game.UI()
Object.assign(Game.UI.column2, Game.UI.column1)
Game.UI.column2._padLeft = 0

Game.UI.column2._x = Game.UI.column1.getX() + Game.UI.column1.getWidth()

Game.UI.hp = new Game.UI(Game.UI.stat.getWidth(), 1)

Game.UI.hp._x = Game.UI.stat.getX()
Game.UI.hp._y = Game.UI.stat.getY() + 3

Game.UI.cl = new Game.UI()
Object.assign(Game.UI.cl, Game.UI.hp)

Game.UI.cl._y = Game.UI.hp.getY() + 1

Game.UI.turn = new Game.UI()
Object.assign(Game.UI.turn, Game.UI.cl)

Game.UI.turn._y += 1.5

Game.UI.curse = new Game.UI(Game.UI.stat.getWidth(), 5)

Game.UI.curse._x = Game.UI.stat.getX()
Game.UI.curse._y = Game.UI.cl.getY() + 3

Game.UI.buff = new Game.UI()
Object.assign(Game.UI.buff, Game.UI.curse)

Game.UI.buff._y += Game.UI.curse.getHeight() + 0.5

Game.UI.debuff = new Game.UI()
Object.assign(Game.UI.debuff, Game.UI.buff)

Game.UI.debuff._y += Game.UI.buff.getHeight() + 0.5

// ``` The first & sceond screen +++
Game.UI.cutScene = new Game.UI(Game.UI.canvas.getWidth() - 10,
  Game.UI.dungeon.getBoxHeight() + Game.UI.message.getBoxHeight())

Game.UI.cutScene._x = 5
Game.UI.cutScene._y = 3

Game.UI.inputSeed = new Game.UI(Game.UI.cutScene.getWidth(), 1)
Game.UI.inputSeed._x = Game.UI.cutScene.getX()
Game.UI.inputSeed._y = Game.UI.cutScene.getY() + 15

// ----- Key-bindings +++++
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
    Game.getDevelop() && console.log(Game.text.devError('mode'))
    return null
  }
  let bindings = bindMap || Game.keyboard.bindMap

  for (const [key, value] of bindings.get(mode)) {
    return value.indexOf(keyInput.key) > -1 ? key : null
  }
}

Game.keyboard.listenEvent = function (event, handler) {
  handler = Game.screens[String(handler)]
    ? Game.screens[handler].keyInput
    : handler

  switch (event) {
    case 'add':
      window.addEventListener('keydown', handler)
      break
    case 'remove':
      window.removeEventListener('keydown', handler)
      break
  }
}

// ----- Screen factory: display content, listen keyboard events +++++
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

// ----- In-game screens & helper functions +++++
Game.screens = {}
Game.screens._currentName = null
Game.screens._currentMode = null
Game.screens._spellLevel = 1
Game.screens._message = []

// general version
// Game.screens.clearBlock = function (x, y, width, height, fillText) {
//   for (let i = x; i < x + width; i++) {
//     for (let j = y; j < y + height; j++) {
//       Game.display.draw(i, j, fillText || null)  // blank by default
//     }
//   }
// }

// ``` Helper functions +++
Game.screens.clearBlock = function (block, fillText) {
  let x = block.getX()
  let y = block.getY()

  for (let i = x; i < x + block.getWidth(); i++) {
    for (let j = y; j < y + block.getHeight(); j++) {
      Game.display.draw(i, j, fillText || null)   // blank by default
    }
  }
}

Game.screens.colorfulText = function (text, fgColor, bgColor) {
  return bgColor
    ? '%c{' + Game.getColor(fgColor) + '}%b{' +
    Game.getColor(bgColor) + '}' + text + '%b{}%c{}'
    : '%c{' + Game.getColor(fgColor) + '}' + text + '%c{}'
}

Game.screens.drawAlignRight = function (x, y, width, text, color) {
  Game.display.drawText(x + width - text.length, y,
    color ? Game.screens.colorfulText(text, color) : text)
}

Game.screens.drawVersion = function () {
  let version = Game.getVersion()

  Game.getDevelop() && (version = 'Wiz|' + version)
  Game.screens.drawAlignRight(Game.UI.stat.getX(), Game.UI.stat.getY(),
    Game.UI.stat.getWidth(), version, 'grey')
}

Game.screens.drawSeed = function () {
  Game.entities.get('seed') && Game.entities.get('seed').Seed &&
    Game.entities.get('seed').Seed.getSeed() &&
    Game.screens.drawAlignRight(
      Game.UI.stat.getX(),
      Game.UI.stat.getY() + Game.UI.stat.getHeight() - 1,
      Game.UI.stat.getWidth(),
      Game.entities.get('seed').Seed.getSeed().match(/^#{0,1}\d{10}$/)
        ? Game.entities.get('seed').Seed.getSeed().replace(
          /^(#{0,1}\d{5})(\d{5})$/, '$1-$2')
        : Game.entities.get('seed').Seed.getSeed(),
      'grey')
}

Game.screens.drawModeLine = function (text) {
  Game.display.drawText(Game.UI.modeLine.getX(), Game.UI.modeLine.getY(), text)
}

Game.screens.drawMessage = function (message) {
  message = message ? String(message) : Game.text.devError('message')
  let uiWidth = Game.UI.message.getWidth()
  let uiHeight = Game.UI.message.getHeight()
  let msgList = Game.screens._message

  msgList.push(message)
  while (blockHeight() > uiHeight) {
    msgList = msgList.slice(1)
  }

  Game.screens.clearBlock(Game.UI.message)
  Game.display.drawText(Game.UI.message.getX(),
    Game.UI.message.getY() + uiHeight - blockHeight(),
    msgList.join('\n'),
    uiWidth)

  function blockHeight () {
    let height = 0
    for (let i = 0; i < msgList.length; i++) {
      height += Math.ceil(msgList[i].length / uiWidth)
    }
    return height
  }
}

Game.screens.drawSpell = function () {
  let pcName = Game.entities.get('pc').ActorName.getTrueName()

  Game.display.drawText(
    Game.UI.column1.getX(), Game.UI.column1.getY(),
    Game.text.spell(1, Game.screens._spellLevel,
      Game.screens._spellLevel === 3 ? pcName : null),
    Game.UI.column1.getWidth())

  Game.display.drawText(
    Game.UI.column2.getX(), Game.UI.column2.getY(),
    Game.text.spell(2, Game.screens._spellLevel, pcName),
    Game.UI.column2.getWidth())
}

Game.screens.drawCurse = function () {
  let curse = Game.entities.get('pc').Curse.getCurse()
  for (let i = 0; i < curse.length; i++) {
    Game.display.drawText(Game.UI.curse.getX(), Game.UI.curse.getY() + i,
      Game.screens.colorfulText(Game.text.curse(curse[i]), 'grey'))
  }
}

Game.screens.drawLevelBar = function (progress) {
  let colored = Game.screens.colorfulText('#'.repeat(progress), 'grey', 'grey')
  let blank = ' '.repeat(10 - progress)

  Game.display.drawText(Game.UI.cl.getX(), Game.UI.cl.getY(),
    'CL [' + colored + blank + ']')
}

Game.screens.drawHPBar = function (current, damage) {
  let color = current - damage > 6
    ? 'green'
    : current - damage > 3
      ? 'yellow'
      : 'red'
  let afterHit = Game.screens.colorfulText('#'.repeat(current - damage),
    color, color)
  let hit = Game.screens.colorfulText('#'.repeat(damage), 'grey', 'grey')
  let blank = ' '.repeat(10 - current)

  Game.display.drawText(Game.UI.hp.getX(), Game.UI.hp.getY(),
    'HP [' + afterHit + hit + blank + ']')
}

Game.screens.drawTurn = function (turn) {
  let last = turn.toString(10)
  let total = Game.entities.get('timer').scheduler.getTime().toString(10)

  last = last.match(/^\d\.\d$/) || last + '.0'
  total = total.match(/\./)
    ? total.match(/^\d{1,4}\.\d$/) || total.match(/\d{4}\.\d$/)
    : total.match(/^\d{1,4}$/)
      ? total.match(/^\d{1,4}$/) + '.0'
      : total.match(/\d{4}$/) + '.0'

  Game.display.drawText(Game.UI.turn.getX(), Game.UI.turn.getY(),
    'TN [' + last + '|' + total + ']')
}

Game.screens.drawStatus = function (type, status) {
  // [[buff1, turn1], [buff2, turn2], ...]
  for (let i = 0; i < status.length; i++) {
    Game.display.drawText(Game.UI[type].getX(), Game.UI[type].getY() + i,
      Game.screens.colorfulText(status[i][0],
        type === 'buff' ? 'green' : 'red'))
    Game.screens.drawAlignRight(Game.UI[type].getX(), Game.UI[type].getY() + i,
      Game.UI[type].getWidth(), status[i][1].toString())
  }
}

Game.screens.drawDungeon = function () {
  let ui = Game.UI.dungeon
  let color = Game.getColor
  let dx = Game.entities.get('dungeon').Dungeon.getDeltaX()
  let dy = Game.entities.get('dungeon').Dungeon.getDeltaY()

  for (const [key, value] of
    Game.entities.get('dungeon').Dungeon.getTerrain()) {
    let x = parseInt(key.split(',')[0])
    let y = parseInt(key.split(',')[1])

    if ((x - dx >= 0) &&
      (x - dx <= ui.getWidth() - 1) &&
      (y - dy >= 0) &&
      (y - dy <= ui.getHeight() - 1)) {
      Game.display.draw(
        ui.getX() + x - dx,
        ui.getY() + y - dy,
        value ? '#' : '.',
        value ? color('grey') : color(null))
    }
  }
  Game.system.drawActor(Game.entities.get('pc'), Game.entities.get('dungeon'))
}

// ``` In-game screens +++
Game.screens.classSeed = new Game.Screen('classSeed')
Game.screens.classSeed.display = function () {
  let x = Game.UI.cutScene.getX()
  let y = Game.UI.cutScene.getY()
  let width = Game.UI.cutScene.getWidth()

  Game.screens.drawVersion()

  !Game.entities.get('seed') && Game.entity.seed()
  Game.entity.pc()

  Game.display.drawText(x, y, Game.text.selectClass('initial'), width)
  Game.screens.drawModeLine(Game.text.modeLine('select'))
}

Game.screens.classSeed.keyInput = function (e) {
  let x = Game.UI.cutScene.getX()
  let y = Game.UI.cutScene.getY() + 7
  let seedList = []       // will be stored in Game.entities.get('seed')
  let seedString = []     // draw on the canvas
  let pcName = Game.entities.get('pc').ActorName

  if (e.key.match(/^[a|b|c]$/)) {
    switch (e.key) {
      case 'a':
        pcName.setTrueName('dio')
        pcName.setColor('orange')
        break
      case 'b':
        pcName.setTrueName('hulk')
        pcName.setColor('green')
        break
      case 'c':
        pcName.setTrueName('lasombra')
        pcName.setColor('grey')
        break
    }
    Game.keyboard.listenEvent('remove', 'classSeed')

    Game.screens.clearBlock(Game.UI.modeLine)
    Game.display.drawText(x, y, Game.text.selectClass(pcName.getTrueName()))
    Game.display.drawText(x, y + 3, Game.text.enterSeed('enter'))
    Game.screens.drawModeLine(Game.text.modeLine('enter') +
      Game.text.modeLine('delete'))

    Game.keyboard.listenEvent('add', verifySeed)
  }

  function verifySeed (e) {
    if (e.key.match(/^[a-zA-Z]$/) && seedList.length < 15) {
      seedList.push(e.key)
      drawSeedBar()
    } else if (e.key === 'Escape' && seedList.length > 0) {
      seedList = seedList.slice(0, seedList.length - 1)
      drawSeedBar()
    } else if (e.key === 'Enter') {
      Game._devSeed
        ? Game.entities.get('seed').Seed.setSeed(Game._devSeed)
        : Game.entities.get('seed').Seed.setSeed(seedList.join(''))

      Game.keyboard.listenEvent('remove', verifySeed)

      Game.screens.clearBlock(Game.UI.modeLine)
      Game.display.drawText(x, y + 10, Game.text.enterSeed('confirm'))
      Game.screens.drawModeLine(Game.text.modeLine('yesNoLower'))

      Game.keyboard.listenEvent('add', confirm)
    }
  }

  function confirm (e) {
    switch (e.key) {
      case 'y':
        Game.keyboard.listenEvent('remove', confirm)

        Game.system.feedRNG(Game.entities.get('seed'))

        Game.screens.classSeed.exit()
        Game.screens.prologue.enter()

        Game.keyboard.listenEvent('add', 'prologue')
        break
      case 'n':
        Game.keyboard.listenEvent('remove', confirm)

        // do not overwrite internal seed: '#1234567', '#abcdefg', etc.
        !Game._devSeed && Game.entities.get('seed').Seed.setSeed(null)
        pcName.setTrueName(null)

        Game.screens.classSeed.exit()
        Game.screens.classSeed.enter()

        Game.keyboard.listenEvent('add', 'classSeed')
        break
    }
  }

  function drawSeedBar () {
    seedString = seedList.join('')
    while (seedString.length < 15) { seedString += ' ' }
    seedString = '[' + seedString + ']'

    Game.screens.clearBlock(Game.UI.inputSeed)
    Game.display.drawText(Game.UI.inputSeed.getX(), Game.UI.inputSeed.getY(),
      seedString)
  }
}

Game.screens.prologue = new Game.Screen('prologue')
Game.screens.prologue.display = function () {
  Game.screens.drawVersion()
  Game.screens.drawSeed()

  Game.display.drawText(Game.UI.cutScene.getX(), Game.UI.cutScene.getY(),
    Game.text.prologue(Game.entities.get('pc').ActorName.getTrueName()),
    Game.UI.cutScene.getWidth())

  Game.entity.dungeon(...Game._dungeonSize)    // Spread operator
  Game.screens.drawModeLine(Game.text.modeLine('space'))
}

Game.screens.prologue.keyInput = function (e) {
  if (e.key === ' ') {
    Game.keyboard.listenEvent('remove', 'prologue')

    Game.screens.prologue.exit()
    Game.screens.main.enter()

    Game.entity.timer()
    Game.entities.get('timer').scheduler.add(Game.entities.get('pc'), true)
    Game.entities.get('timer').engine.start()
  }
}

Game.screens.main = new Game.Screen('main')
Game.screens.main.display = function () {
  let ui = Game.UI
  let pcEntity = Game.entities.get('pc')
  let pcName = pcEntity.ActorName
  let pcCurse = pcEntity.Curse
  let dungeon = Game.entities.get('dungeon').Dungeon

  Game.screens.drawVersion()
  Game.screens.drawSeed()

  placePC()
  Game.screens.drawDungeon()

  // engine starts AFTER display
  Game.display.drawText(ui.turn.getX(), ui.turn.getY(), 'TN [?.?|?]')

  Game.screens.drawAlignRight(ui.stat.getX(), ui.stat.getY() + 1.5,
    ui.stat.getWidth(), pcName.getStageName(), pcName.getColor())

  Game.screens.drawAlignRight(ui.spell.getX(), ui.spell.getY(),
    ui.spell.getWidth(), '[1.5]')

  Game.system.gainHP(pcEntity, pcEntity)

  Game.system.updateStatus('Buff', 'mov', -4, pcEntity)
  Game.system.updateStatus('Buff', 'mov', 1, pcEntity)
  Game.system.updateStatus('Buff', 'imm', 4, pcEntity)

  Game.system.updateLevel(24, pcEntity)
  Game.system.updateLevel(24, pcEntity)

  pcEntity.Debuff.getStatus('acc').setMax(2)
  Game.system.updateStatus('Debuff', 'acc', 0.5, pcEntity)

  Game.screens.drawSpell()
  drawBorder()

  Game.screens.drawAlignRight(ui.spell.getX(), ui.spell.getY() + 1,
    ui.spell.getWidth(), Game.text.spell(3),
    pcCurse.getLevel() < 2 ? 'grey' : null)

  function placePC () {
    let x = 0
    let y = 0
    let boundary = dungeon.getBoundary()
    let mapWidth = dungeon.getWidth()
    let mapHeight = dungeon.getHeight()
    let uiWidth = ui.dungeon.getWidth()
    let uiHeight = ui.dungeon.getHeight()

    do {
      x = Math.floor(ROT.RNG.getUniform() * dungeon.getWidth())
      y = Math.floor(ROT.RNG.getUniform() * dungeon.getHeight())
    } while ((dungeon.getTerrain().get(x + ',' + y) !== 0) ||
    x < boundary || (x > mapWidth - boundary) ||
    y < boundary || (y > mapHeight - boundary))

    pcEntity.Position.setX(x)
    pcEntity.Position.setY(y)

    dungeon.setDeltaX(x - Math.ceil(uiWidth / 2) > 0
      ? Math.min(x - Math.ceil(uiWidth / 2), mapWidth - uiWidth)
      : 0)
    dungeon.setDeltaY(y - Math.ceil(uiHeight / 2) > 0
      ? Math.min(y - Math.ceil(uiHeight / 2), mapHeight - uiHeight)
      : 0)
  }

  function drawBorder () {
    for (let i = ui.stat.getY(); i < ui.stat.getHeight(); i++) {
      Game.display.draw(ui.stat.getX() - 1, i, '|')
    }
    for (let i = ui.spell.getX(); i < ui.spell.getWidth() + 1; i++) {
      Game.display.draw(i, ui.spell.getY() + ui.spell.getHeight(), '-')
      Game.display.draw(i, ui.dungeon.getY() + ui.dungeon.getHeight(), '-')
    }
  }
}

Game.screens.main.keyInput = function (e) {
  let eDungeon = Game.entities.get('dungeon').Dungeon
  let ePC = Game.entities.get('pc').Position
  let eScheduler = Game.entities.get('timer').scheduler
  let eDuration = Game.entities.get('timer').Duration

  let dx = eDungeon.getDeltaX()
  let dy = eDungeon.getDeltaY()
  let ui = Game.UI

  let acted = false
  let lastTurn = 0

  if (e.key === ' ') {
    updateSpell()
  } else if (e.key === 'ArrowLeft' &&
    Game.system.isWalkable(Game.entities.get('dungeon'),
      ePC.getX() - 1, ePC.getY())) {
    lastTurn = eDuration.getDuration('mov')
    eScheduler.setDuration(lastTurn)

    moveLeft()
    updateStatus()

    acted = true
  } else if (e.key === 'ArrowRight' &&
    Game.system.isWalkable(Game.entities.get('dungeon'),
      ePC.getX() + 1, ePC.getY())) {
    lastTurn = eDuration.getDuration('mov')
    eScheduler.setDuration(lastTurn)

    moveRight()
    updateStatus()

    acted = true
  } else if (e.key === 'ArrowUp' &&
    Game.system.isWalkable(Game.entities.get('dungeon'),
      ePC.getX(), ePC.getY() - 1)) {
    lastTurn = eDuration.getDuration('mov')
    eScheduler.setDuration(lastTurn)

    moveUp()
    updateStatus()

    acted = true
  } else if (e.key === 'ArrowDown' &&
    Game.system.isWalkable(Game.entities.get('dungeon'),
      ePC.getX(), ePC.getY() + 1)) {
    lastTurn = eDuration.getDuration('mov')
    eScheduler.setDuration(lastTurn)

    moveDown()
    updateStatus()

    acted = true
  }

  if (acted) {
    Game.keyboard.listenEvent('remove', 'main')
    Game.screens.drawMessage(eScheduler.getTime() + ': Moved!')

    Game.entities.get('timer').engine.unlock()
  } else {
    Game.screens.drawMessage(eScheduler.getTime() + ': Invalid action!')
  }

  function moveLeft () {
    ePC.getX() - dx > eDungeon.getBoundary()
      ? ePC.setX(ePC.getX() - 1)
      : dx > 0
        ? eDungeon.setDeltaX(dx - 1) && ePC.setX(ePC.getX() - 1)
        : ePC.getX() - dx > 0 && ePC.setX(ePC.getX() - 1)
  }

  function moveUp () {
    ePC.getY() - dy > eDungeon.getBoundary()
      ? ePC.setY(ePC.getY() - 1)
      : dy > 0
        ? eDungeon.setDeltaY(dy - 1) && ePC.setY(ePC.getY() - 1)
        : ePC.getY() - dy > 0 && ePC.setY(ePC.getY() - 1)
  }

  function moveRight () {
    ePC.getX() - dx < ui.dungeon.getWidth() - 1 - eDungeon.getBoundary()
      ? ePC.setX(ePC.getX() + 1)
      : dx < eDungeon.getWidth() - ui.dungeon.getWidth()
        ? eDungeon.setDeltaX(dx + 1) && ePC.setX(ePC.getX() + 1)
        : ePC.getX() - dx < ui.dungeon.getWidth() - 1 &&
        ePC.setX(ePC.getX() + 1)
  }

  function moveDown () {
    ePC.getY() - dy < ui.dungeon.getHeight() - 1 - eDungeon.getBoundary()
      ? ePC.setY(ePC.getY() + 1)
      : dy < eDungeon.getHeight() - ui.dungeon.getHeight()
        ? eDungeon.setDeltaY(dy + 1) && ePC.setY(ePC.getY() + 1)
        : ePC.getY() - dy < ui.dungeon.getHeight() - 1 &&
        ePC.setY(ePC.getY() + 1)
  }

  function updateStatus () {
    Game.screens.clearBlock(ui.dungeon)
    Game.screens.drawDungeon()

    Game.screens.clearBlock(ui.turn)
    Game.screens.drawTurn(lastTurn)
  }

  function updateSpell () {
    Game.screens.clearBlock(ui.column1)
    Game.screens.clearBlock(ui.column2)

    Game.screens._spellLevel =
      Game.screens._spellLevel < Game.entities.get('pc').Curse.getLevel()
        ? Game.screens._spellLevel + 1
        : 1

    Game.screens.drawSpell()
  }
}

// ----- Test +++++
Game.tmp = {}
Game.tmp.upper = function (text) {
  return text.toUpperCase()
}

// ----- Initialization +++++
window.onload = function () {
  if (!ROT.isSupported()) {
    window.alert(Game.text.devError('browser'))
    return
  }
  document.getElementById('game').appendChild(Game.display.getContainer())
  Game.screens.classSeed.enter()

  Game.keyboard.listenEvent('add', 'classSeed')
}
