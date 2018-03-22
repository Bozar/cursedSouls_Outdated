'use strict'

Game.system = {}

Game.system.feedRNG = function () {
  let e = Game.entities.get('seed')

  feed(verify())

  function feed (seed) {
    seed
      ? printRNG(seed)
      : Game.getDevelop() && console.log(Game.text.devError('seed'))
  }

  function printRNG (seed) {
    let rndList = []

    ROT.RNG.setSeed(seed)

    for (let i = 0; i < 5; i++) {
      rndList.push(ROT.RNG.getUniform())
    }

    Game.getDevelop() &&
      console.log(Game.text.devNote('rng') + JSON.stringify(rndList, null, 2))
  }

  function verify () {
    let seed = e.Seed.getSeed().replace(/^#/, '').toLowerCase()   // string

    if (seed.match(/^[a-z]+$/)) {
      seed = str2num(seed)
    } else if (seed.match(/^\d+$/)) {
      seed = Number.parseInt(seed, 10)
    } else {
      seed = null
    }

    return seed
  }

  function str2num (str) {  // 'abc'
    str = str.split('')     // ['a', 'b', 'c', ...]
    let result = 1
    let max = Math.floor(Number.MAX_SAFE_INTEGER / 27)

    str.forEach((aplhabet, index, seedList) => {
      seedList[index] = aplhabet.charCodeAt(0) - 95   // a: 2, b: 3, ...
    })

    for (let i = 0; i < str.length; i++) {
      result < max
        ? result *= str[i]
        : result /= str[i]
    }

    return result
  }
}

Game.system.updateCurse = function (what) {
  let e = Game.entities.get('pc')

  switch (what) {
    case 'gain':
      gainCurse()
      break
    case 'lose':
      e.Curse.getCurse().pop()
      break
  }

  function gainCurse () {
    let fullList = Array.from(Game.text.curse(null, true).keys())
    let curseLen = e.Curse.getCurse().length

    if (curseLen < 3) {
      e.Curse.gainCurse(fullList[curseLen])
    } else if (curseLen === 3) {
      switch (e.ActorName.getTrueName()) {
        case 'dio':
          e.Curse.gainCurse('attack')
          break
        case 'hulk':
          e.Curse.gainCurse('resist')
          break
        case 'lasombra':
          e.Curse.gainCurse('control')
          break
      }
    } else if (curseLen === 4) {
      e.Curse.gainCurse('shroud')
    }
  }
}

Game.system.updateCursePoint = function (point) {
  let e = Game.entities.get('pc')

  e.Curse.getPoint() + point >= e.Curse.getMaxPoint()
    ? overMax()
    : e.Curse.getPoint() + point >= 0
      ? e.Curse.gainPoint(point)
      : belowZero()

  function overMax () {
    e.Curse.setPoint(e.Curse.getPoint() + point - e.Curse.getMaxPoint())
    Game.system.updateCurse('gain')
  }

  function belowZero () {
    e.Curse.setPoint(e.Curse.getPoint() + point + e.Curse.getMaxPoint())
    Game.system.updateCurse('lose')
  }
}

Game.system.isWalkable = function (x, y) {
  return Game.entities.get('dungeon').Dungeon
    .getTerrain().get(x + ',' + y) === 0
}

Game.system.isPC = function (e) {
  return e && Game.entities.get('pc')
    ? verify()
    : false

  function verify () {
    return e.getID() === Game.entities.get('pc').getID()
  }
}

Game.system.pcAct = function () {
  let e = Game.entities.get('pc')
  let fast = e.FastMove

  Game.entities.get('timer').engine.lock()

  Game.system.updateStatus(e)

  if (fast.getFastMove()) {
    if (fast.getCurrentStep() < fast.getMaxStep() &&
      Game.system.move(fast.getDirection(), e)) {
      fast.setCurrentStep(fast.getCurrentStep() + 1)

      Game.entities.get('timer').engine.unlock()

      Game.display.clear()
      Game.screens.main.display()
    } else {
      fast.setFastMove(false)
      fast.setCurrentStep(0)
      fast.setDirection(null)

      Game.keyboard.listenEvent('add', 'main')
    }
  } else {
    Game.keyboard.listenEvent('add', 'main')
  }
}

Game.system.move = function (direction, e) {
  let pos = e.Position
  let uiDungeon = Game.UI.dungeon
  let eDungeon = Game.entities.get('dungeon').Dungeon
  let dx = eDungeon.getDeltaX()
  let dy = eDungeon.getDeltaY()

  let lastTurn = Game.system.updateAttribute('mov', e, null)
  let scheduler = Game.entities.get('timer').scheduler

  let where = new Map()
  where.set('left', moveLeft)
  where.set('right', moveRight)
  where.set('up', moveUp)
  where.set('down', moveDown)
  where.set('wait', wait1Turn)

  return e && e.Position && where.get(direction)
    ? where.get(direction)()
    : false

  function wait1Turn () {
    scheduler.setDuration(1)
    Game.system.isPC(e) && e.ActorClock.setLastAction(1)

    return true
  }

  function moveLeft () {
    if (Game.system.isWalkable(pos.getX() - 1, pos.getY())) {
      scheduler.setDuration(lastTurn)
      pos.setX(pos.getX() - 1)

      if (Game.system.isPC(e)) {
        e.ActorClock.setLastAction(lastTurn)

        pos.getX() - dx <= eDungeon.getBoundary() &&
          dx >= 0 &&      // dx === -1, draw map border on the screen
          eDungeon.setDeltaX(dx - 1)
      }
      return true
    }
    return false
  }

  function moveRight () {
    if (Game.system.isWalkable(pos.getX() + 1, pos.getY())) {
      scheduler.setDuration(lastTurn)
      pos.setX(pos.getX() + 1)

      if (Game.system.isPC(e)) {
        e.ActorClock.setLastAction(lastTurn)

        pos.getX() - dx >= uiDungeon.getWidth() - 1 - eDungeon.getBoundary() &&
          dx <= eDungeon.getWidth() - uiDungeon.getWidth() &&
          eDungeon.setDeltaX(dx + 1)
      }
      return true
    }
    return false
  }

  function moveUp () {
    if (Game.system.isWalkable(pos.getX(), pos.getY() - 1)) {
      scheduler.setDuration(lastTurn)
      pos.setY(pos.getY() - 1)

      if (Game.system.isPC(e)) {
        e.ActorClock.setLastAction(lastTurn)

        pos.getY() - dy <= eDungeon.getBoundary() &&
          dy >= 0 &&
          eDungeon.setDeltaY(dy - 1)
      }
      return true
    }
    return false
  }

  function moveDown () {
    if (Game.system.isWalkable(pos.getX(), pos.getY() + 1)) {
      scheduler.setDuration(lastTurn)
      pos.setY(pos.getY() + 1)

      if (Game.system.isPC(e)) {
        e.ActorClock.setLastAction(lastTurn)

        pos.getY() - dy >= uiDungeon.getHeight() - 1 - eDungeon.getBoundary() &&
          dy <= eDungeon.getHeight() - uiDungeon.getHeight() &&
          eDungeon.setDeltaY(dy + 1)
      }
      return true
    }
    return false
  }
}

Game.system.fastMove = function (direction) {
  let e = Game.entities.get('pc')

  if (Game.system.move(direction, e)) {
    e.FastMove.setFastMove(true)
    e.FastMove.setDirection(direction)

    return true
  }
  return false
}

Game.system.pcCast = function (spellID) {
  let e = Game.entities.get('pc')
  let message = Game.screens.drawMessage
  let scheduler = Game.entities.get('timer').scheduler
  let duration = Game.entities.get('data').Duration
  let lastTurn = 0

  let spellMap = new Map()
  spellMap.set('enh1', enhance1)
  spellMap.set('spc1', special1)

  return castSpell()

  function castSpell () {
    if (spellMap.get(spellID) && spellMap.get(spellID)()) {
      e.ActorClock.setLastAction(lastTurn)
      scheduler.setDuration(lastTurn)

      return true
    }
    return false
  }

  function enhance1 () {
    if (e.HitPoint.getHP()[1] < e.HitPoint.getMax()) {
      lastTurn = duration.getSpell(1)

      e.HitPoint.gainHP(e.HitPoint.getMax())
      e.Status.gainStatus('buff', 'mov', lastTurn)

      e.HitPoint.getHP()[1] < e.HitPoint.getMax()
        ? message(Game.text.pcStatus('heal'))
        : message(Game.text.pcStatus('heal2Max'))

      return true
    } else {
      message(Game.text.pcStatus('maxHP'))
      return false
    }
  }

  function special1 () {
    switch (e.ActorName.getTrueName()) {
      case 'dio':
        return dio1()
      case 'hulk':
        return hulk1()
      case 'lasombra':
        return lasombra1()
      default:
        return false
    }

    function dio1 () {

    }

    function hulk1 () {
      lastTurn = duration.getSpell(1)

      e.Status.gainStatus('buff', 'acc', lastTurn)
      e.Status.gainStatus('buff', 'def', lastTurn)

      message(Game.text.pcStatus('puppet'))

      return true
    }

    function lasombra1 () {

    }
  }
}

// status: temporary or long-lasting buff/debuff
Game.system.updateStatus = function (e) {
  e && e.Status && update()

  function update () {
    let status = ['buff', 'debuff']

    for (let i = 0; i < status.length; i++) {
      if (e.Status.getStatus(status[i]).size > 0) {
        for (const keyValue of e.Status.getStatus(status[i])) {
          !e.Status.isActive(status[i], keyValue[0]) &&
            e.Status.getStatus(status[i]).delete(keyValue[0])
        }
      }
    }
  }
}

// attribute: data that is changed by status
Game.system.updateAttribute = function (attrID, defender, attacker) {
  let duration = Game.entities.get('data').Duration
  let modAttr = Game.entities.get('data').ModAttribute
  let attrMap = new Map()

  attrMap.set('mov', moveSpeed)
  attrMap.set('acc', accuracy)
  attrMap.set('def', defense)

  return attrID && attrMap.get(attrID) && defender && defender.Status
    ? attrMap.get(attrID)()
    : null

  function moveSpeed () {
    return duration.getMove() - modAttr.getMod('buff', 'mov',
      defender.Status.isActive('buff', 'mov'))
  }

  function accuracy () {
    return defender.Combat
      ? defender.Combat.getAccuracy() +
      modAttr.getMod('buff', 'acc',
        defender.Status.isActive('buff', 'acc')) -
      modAttr.getMod('debuff', 'acc',
        defender.Status.isActive('debuff', 'acc'))
      : 0
  }

  function defense () {
    return defender.Combat
      ? defender.Combat.getDefense() +
      modAttr.getMod('buff', 'def',
        defender.Status.isActive('buff', 'def')) -
      modAttr.getMod('debuff', 'def',
        defender.Status.isActive('debuff', 'def'))
      : 0
  }
}
