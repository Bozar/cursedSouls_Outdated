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

  let lastTurn = Game.system.updateAttribute('moveSpeed', e, null)
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

  let spellLevel = Number.parseInt(spellID.match(/\d$/)[0])
  let lastTurn = Game.system.updateAttribute('castSpeed', e).get(spellLevel)

  let spellMap = new Map()
  spellMap.set('enh1', enhance1)
  spellMap.set('enh2', enhance2)
  spellMap.set('spc1', special1)
  spellMap.set('spc2', special2)

  return castSpell()

  function castSpell () {
    if (spellMap.get(spellID) && spellMap.get(spellID)()) {
      e.ActorClock.setLastAction(lastTurn)
      Game.entities.get('timer').scheduler.setDuration(lastTurn)

      return true
    }
    return false
  }

  function enhance1 () {
    if (e.HitPoint.getHP()[1] < e.HitPoint.getMax()) {
      e.HitPoint.gainHP(e.HitPoint.getMax())
      e.Status.gainStatus('buff', 'mov0', lastTurn)

      e.HitPoint.getHP()[1] < e.HitPoint.getMax()
        ? message(Game.text.pcStatus('heal'))
        : message(Game.text.pcStatus('heal2Max'))

      return true
    } else {
      message(Game.text.pcStatus('maxHP'))
      return false
    }
  }

  function enhance2 () {
    if (e.Status.getStatus('debuff').size > 0) {
      let maxTurn = Math.min(4, 1 + e.Status.getStatus('debuff').size)

      e.Status.gainStatus('buff', 'acc0', lastTurn, maxTurn)
      message(Game.text.pcStatus('lucky'))

      return true
    } else {
      message(Game.text.pcStatus('unlucky'))

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
      e.Status.gainStatus('buff', 'acc1', lastTurn)
      e.Status.gainStatus('buff', 'def1', lastTurn)
      message(Game.text.pcStatus('puppet'))

      return true
    }

    function lasombra1 () {

    }
  }

  function special2 () {
    switch (e.ActorName.getTrueName()) {
      case 'dio':
        return dio2()
      case 'hulk':
        return hulk2()
      case 'lasombra':
        return lasombra2()
      default:
        return false
    }

    function dio2 () {

    }

    function hulk2 () {
      e.Status.gainStatus('buff', 'cst1', lastTurn)
      message(Game.text.pcStatus('castFaster'))

      return true
    }

    function lasombra2 () {

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

  attrMap.set('moveSpeed', moveSpeed)
  attrMap.set('accuracy', accuracy)
  attrMap.set('defense', defense)
  attrMap.set('castSpeed', castSpeed)

  return attrID && attrMap.get(attrID) && defender && defender.Status
    ? attrMap.get(attrID)()
    : null

  function moveSpeed () {
    return duration.getMove() - modAttr.getMod('buff', 'mov0',
      defender.Status.isActive('buff', 'mov0'))
  }

  function accuracy () {
    return defender.Combat
      ? defender.Combat.getAccuracy() +
      modAttr.getMod('buff', 'acc1',
        defender.Status.isActive('buff', 'acc1')) +
      modAttr.getMod('buff', 'acc0',
        defender.Status.isActive('buff', 'acc0')) -
      modAttr.getMod('debuff', 'acc0',
        defender.Status.isActive('debuff', 'acc0'))
      : 0
  }

  function defense () {
    return defender.Combat
      ? defender.Combat.getDefense() +
      modAttr.getMod('buff', 'def1',
        defender.Status.isActive('buff', 'def1')) -
      modAttr.getMod('debuff', 'def0',
        defender.Status.isActive('debuff', 'def0'))
      : 0
  }

  function castSpeed () {
    let level1 = duration.getSpell(1)
    let level2 = duration.getSpell(2)
    let level3 = duration.getSpell(3)

    let buff = modAttr.getMod('buff', 'cst1',
      defender.Status.isActive('buff', 'cst1'))

    return new Map([
      [1, level1 - buff],
      [2, level2 - buff],
      [3, level3]
    ])
  }
}
