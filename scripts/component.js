'use strict'

Game.Component = {}

Game.Component.Dungeon = function (width, height) {
  this._name = 'Dungeon'

  this._width = width
  this._height = height
  this._terrain = new Map()   // z,x,y: 0(floor) or 1(wall)
  this._deltaX = 0
  this._deltaY = 0
  this._boundary = 5          // move screen when pc is close to the border

  this._memory = []           // explored dungeon

  this.getWidth = function () { return this._width }
  this.getHeight = function () { return this._height }
  this.getTerrain = function () { return this._terrain }

  this.getDeltaX = function () { return this._deltaX }
  this.getDeltaY = function () { return this._deltaY }
  this.getBoundary = function () { return this._boundary }

  this.getMemory = function () { return this._memory }

  this.setDeltaX = function (delta) {
    this._deltaX = delta
    return true
  }
  this.setDeltaY = function (delta) {
    this._deltaY = delta
    return true
  }
}

Game.Component.Seed = function () {
  this._name = 'Seed'

  this._seed = null

  this.getSeed = function () { return this._seed }
  this.setSeed = function (seed) {
    seed === ''
      ? this._seed =
      Math.floor((Math.random() * 9 + 1) * Math.pow(10, 9)).toString()
      : seed === null
        ? this._seed = null
        : this._seed = seed.toString()

    return true
  }
}

Game.Component.ActorName = function (stageN, trueN, color) {
  this._name = 'ActorName'

  this._stageName = stageN    // player can see
  this._trueName = trueN      // internal ID
  this._color = color || ''   // fgColor

  this.getStageName = function () { return this._stageName }
  this.getTrueName = function () { return this._trueName }
  this.getColor = function () { return this._color }

  this.setTrueName = function (name) {
    this._trueName = name
    return true
  }
  this.setColor = function (color) {
    this._color = color
    return true
  }
}

// Actor's position in the dungeon map
Game.Component.Position = function (sight) {
  this._name = 'Position'

  this._x = null
  this._y = null
  this._sight = sight   // how far one can see

  this.getX = function () { return this._x }
  this.getY = function () { return this._y }
  this.getSight = function () { return this._sight }

  this.setX = function (pos) {
    this._x = pos
    return true
  }
  this.setY = function (pos) {
    this._y = pos
    return true
  }
}

Game.Component.Display = function (char, fgColor, bgColor) {
  this._name = 'Display'

  this._character = char || '烫'    // use '烫' for testing
  this._fgColor = fgColor || ''    // default: Game.display, '#abb2bf'
  this._bgColor = bgColor || ''    // default: Game.display, '#262626'

  this.getCharacter = function () { return this._character }
  this.getFgColor = function () { return this._fgColor }
  this.getBgColor = function () { return this._bgColor }

  this.setFgColor = function (color) {
    this._fgColor = color
    return true
  }
  this.setBgColor = function (color) {
    this._bgColor = color
    return true
  }
}

Game.Component.Curse = function () {
  this._name = 'Curse'

  this._cursedPoint = 0
  this._maxPoint = 25
  this._hasCurse = []
  this._screenLevel = 1   // which level of spells to be shown on screen

  this.getPoint = function () { return this._cursedPoint }
  this.getMaxPoint = function () { return this._maxPoint }
  this.getCurse = function () { return this._hasCurse }
  this.getScreenLevel = function () { return this._screenLevel }
  this.getPClevel = function () { return Math.ceil(this._hasCurse.length / 2) }

  this.gainPoint = function (point) {
    this._cursedPoint += point
    return true
  }
  this.setPoint = function (point) {
    this._cursedPoint = point
    return true
  }

  this.gainCurse = function (curse) {
    this._hasCurse.push(curse)
    return true
  }
  this.loseCurse = function () {
    this._hasCurse.pop()
    return true
  }

  this.setScreenLevel = function () {
    this._screenLevel < this.getPClevel()
      ? this._screenLevel += 1
      : this._screenLevel = 1

    return true
  }
}

Game.Component.HitPoint = function (maxHp) {
  this._name = 'HitPoint'

  this._maxHP = maxHp
  this._hitpoint = [maxHp, maxHp]   // [hp before hit/helaed, current hp]

  this.getMax = function () { return this._maxHP }
  this.getHP = function () { return this._hitpoint }

  this.setMax = function (hp) {
    this._maxHP = hp
    return true
  }
}

// library is NOT a constructor, see Game.systems.gainBuff
Game.Component.buffLibrary = function (id) {
  let buff = new Map()

  buff.set('acc', 3)
  buff.set('def', 3)
  buff.set('imm', 3)
  buff.set('mov', 1.5)
  buff.set('cst', 5)

  return [id, buff.get(id)]
}

Game.Component.debuffLibrary = function (id) {
  let debuff = new Map()

  debuff.set('hp', 9)
  debuff.set('acc', 9)
  debuff.set('def', 9)
  debuff.set('dmg', 9)
  debuff.set('cst', 9)
  debuff.set('poi', 9)

  return [id, debuff.get(id)]
}

Game.Component.Buff = function () {
  this._name = 'Buff'

  this._buff = new Map()

  this.gainStatus = function (status) {
    this._buff.set(...status)   // [buffID, maxTurn]
    return true
  }
  this.getStatus = function (id) {
    return id
      ? this._buff.get(id)
      : this._buff
  }
}

Game.Component.Debuff = function () {
  this._name = 'Debuff'

  this._debuff = new Map()

  this.gainStatus = function (status) {
    this._debuff.set(...status)
    return true
  }
  this.getStatus = function (id) {
    return id
      ? this._debuff.get(id)
      : this._debuff
  }
}

Game.Component.Duration = function () {
  this._name = 'Duration'

  this._duration = new Map()

  this._duration.set('mov', 1)

  this.getDuration = function (action) { return this._duration.get(action) }
}

Game.Component.ActorClock = function () {
  this._name = 'ActorClock'

  this._lastAction = 0    // how many turns dose the last action take

  this.getLastAction = function () { return this._lastAction }

  this.setLastAction = function (turn) {
    this._lastAction = turn
    return true
  }
}
