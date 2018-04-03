'use strict'

Game.Component = {}

Game.Component.Dungeon = function () {
  this._name = 'Dungeon'

  this._width = 55
  this._height = 20
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
  this._sight = sight || 0   // how far one can see

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
  this.setSight = function (range) {
    this._sight = range
    return true
  }
}

Game.Component.Display = function (char, fgColor, bgColor) {
  this._name = 'Display'

  this._character = char || '烫'    // use '烫' for testing
  this._fgColor = Game.getColor(fgColor) || ''  // Game._color, '#abb2bf'
  this._bgColor = Game.getColor(bgColor) || ''  // Game._color, '#262626'

  this.getCharacter = function () { return this._character }
  this.getFgColor = function () { return this._fgColor }
  this.getBgColor = function () { return this._bgColor }

  this.setCharacter = function (char) {
    this._character = char
    return true
  }
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

  this._maxHP = maxHp || null
  this._hitpoint = [maxHp, maxHp]   // [hp before hit/helaed, current hp]

  this.getMax = function () { return this._maxHP }
  this.getHP = function () { return this._hitpoint }
  this.getHPfraction = function () {
    return Math.floor(this._hitpoint[1] / this._maxHP * 10)
  }

  this.setMax = function (hp) {
    this._maxHP = hp
    this._hitpoint.push(hp)
    this._hitpoint.shift()
    return true
  }

  this.gainHP = function (max) {
    let healed = Math.min(max, this._hitpoint[1] + Math.floor(max / 4))

    this._hitpoint.push(healed)
    this._hitpoint.shift()
  }

  this.loseHP = function (damage) {
    let afterHit = this._hitpoint[1] - damage

    this._hitpoint.push(Math.max(0, afterHit))
    this._hitpoint.shift()
  }
}

Game.Component.Combat = function (acc, def, dmg) {
  this._name = 'Combat'

  this._accuracy = acc || null
  this._defense = def || null
  this._damage = dmg || null
  this._dmgBonus = [1, 1.5, 2, 2.5]

  this.getAccuracy = function () { return this._accuracy }
  this.getDefense = function () { return this._defense }
  this.getDamage = function (critical, addBonus) {
    if (addBonus) {
      let index = Math.min(critical, this._dmgBonus.length - 1)
      return Math.floor(this._damage * this._dmgBonus[index])
    } else {
      return this._damage
    }
  }

  this.setAccuracy = function (acc) {
    this._accuracy = acc
    return true
  }
  this.setDefense = function (def) {
    this._defense = def
    return true
  }
  this.setDamage = function (dmg) {
    this._damage = dmg
    return true
  }
}

Game.Component.Status = function () {
  this._name = 'Status'

  let capital = Game.screens.capitalizeFirst
  let duration = Game.entities.get('data').Duration
  let scheduler = Game.entities.get('timer').scheduler

  this._buff = new Map()
  this._debuff = new Map()
  this._maxStatus = 4

  this.gainStatus = function (type, id, castTurn, maxTurn) {
    let typeMap = this['_' + type]
    // some status's maxTurn needs to be set on-site
    // refer: Game.system.pcCast, enhance2
    let max = maxTurn || duration['get' + capital(type)](id)

    if (typeMap.size >= this._maxStatus) {
      Game.getDevelop() && console.log(
        Game.text.devNote('max' + Game.screens.capitalizeFirst(type)))
      return false
    }

    typeMap.set(id, [])   // [maxTurn, startTurn]
    typeMap.get(id).push(max)
    // the buff/debuff will take effect AFTER the actor's turn
    typeMap.get(id).push(scheduler.getTime() + castTurn)

    return true
  }

  this.isActive = function (type, id) {
    let status = this['_' + type].get(id)
    let now = scheduler.getTime()

    return status && now < status[0] + status[1]
  }

  this.getRemain = function (type, id) {
    let now = scheduler.getTime()
    let start = this['_' + type].get(id)[1]
    let maxTurn = this['_' + type].get(id)[0]

    return (maxTurn - (now - start)).toFixed(1)
  }

  this.getStatus = function (type, id) {
    return type
      ? id
        ? this['_' + type].get(id)
        : this['_' + type]
      : null
  }
}

Game.Component.Duration = function () {
  this._name = 'Duration'

  this._move = new Map()
  this._move.set('mov', 1)

  this._buff = new Map()
  this._buff.set('acc1', 2)
  this._buff.set('acc0', 0)
  this._buff.set('def1', 2)
  this._buff.set('imm', 3)
  this._buff.set('mov0', 1.5)
  this._buff.set('cst1', 2.5)

  this._debuff = new Map()
  this._debuff.set('hp0', 9)
  this._debuff.set('acc0', 9)
  this._debuff.set('def', 9)
  this._debuff.set('dmg', 9)
  this._debuff.set('cst', 9)
  this._debuff.set('poi', 9)

  this._spell = new Map()
  this._spell.set(0, 1.2)
  this._spell.set(1, 1.4)
  this._spell.set(2, 1.8)
  this._spell.set(3, 2.2)
  this._spell.set(4, 2.6)

  this.getMove = function () { return this._move.get('mov') }
  this.getBuff = function (id) { return this._buff.get(id) }
  this.getDebuff = function (id) { return this._debuff.get(id) }
  this.getSpell = function (level) { return this._spell.get(level) }
}

Game.Component.Range = function () {
  this._name = 'Range'

  this._range = new Map()

  this._range.set('atk1', 3)
  this._range.set('atk2', 5)
  this._range.set('dio1', 1)

  this.getRange = function (id) { return this._range.get(id) }
}

Game.Component.ModAttribute = function () {
  this._name = 'ModAttribute'

  this._buff = new Map()
  this._debuff = new Map()

  // game turns
  this._buff.set('mov0', 0.1)
  this._buff.set('cst1', 0.2)

  // to-hit chance
  this._buff.set('acc1', 20)
  this._buff.set('acc0', 10)
  this._buff.set('def1', 20)

  this.getMod = function (type, id, isModified) {
    let thisType = this['_' + type]

    return type && id && thisType && thisType.get(id) && isModified
      ? thisType.get(id)
      : 0
  }
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

Game.Component.FastMove = function () {
  this._name = 'FastMove'

  this._isFastMove = false
  this._maxStep = 9
  this._currentStep = 0
  this._direction = null

  this.getFastMove = function () { return this._isFastMove }
  this.getMaxStep = function () { return this._maxStep }
  this.getCurrentStep = function () { return this._currentStep }
  this.getDirection = function () { return this._direction }

  this.setFastMove = function (status) {
    this._isFastMove = status
    return true
  }
  this.setCurrentStep = function (step) {
    this._currentStep = step
    return true
  }
  this.setDirection = function (direction) {
    this._direction = direction
    return true
  }
}

Game.Component.Message = function () {
  this._name = 'Message'

  this._message = []

  this.getMessage = function () { return this._message }

  this.gainMessage = function (msg) {
    msg && this._message.push(String(msg))

    while (this._message.length > Game.UI.message.getHeight()) {
      this._message.shift()
    }
    return true
  }
}

Game.Component.Description = function () {
  this._name = 'Description'

  this._flavorText = ''
  this._buff = ''
  this._debuff = ''
  this._dogTag = ''

  this.getTextList = function () {
    return [this._flavorText, this._buff, this._debuff, this._dogTag]
  }

  this.setFlavor = function (text) {
    this._flavorText = text
    return true
  }
  this.setBuff = function (text) {
    this._buff = text
    return true
  }
  this.setDebuff = function (text) {
    this._debuff = text
    return true
  }
  this.setDogTag = function (text) {
    this._dogTag = text
    return true
  }

  this.reset = function () {
    this._flavorText = ''
    this._buff = ''
    this._debuff = ''
    this._dogTag = ''

    return true
  }
}

Game.Component.Level = function (level) {
  this._name = 'Level'

  this._level = level || 0

  this.getLevel = function () { return this._level }
  this.setLevel = function (level) {
    this._level = level
    return true
  }
}
