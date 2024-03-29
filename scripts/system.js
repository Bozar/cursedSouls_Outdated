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

Game.system.isWalkable = function (x, y, e) {
  let pc = Game.entities.get('pc').Position
  let dungeon = Game.entities.get('dungeon')
  let walkable = false

  if (e && e.getID() === Game.entities.get('marker').getID()) {
    let inSight = []

    dungeon.fov.compute(pc.getX(), pc.getY(), pc.getSight(),
      function (x, y) { inSight.push(x + ',' + y) })

    walkable = inSight.indexOf(x + ',' + y) > -1
  } else {
    walkable = dungeon.Dungeon.getTerrain().get(x + ',' + y) === 0 &&
      !Game.system.npcHere(x, y) &&
      !Game.system.pcHere(x, y)
  }

  return walkable
}

Game.system.isPC = function (e) {
  return e && Game.entities.get('pc')
    ? verify()
    : false

  function verify () {
    return e.getID() === Game.entities.get('pc').getID()
  }
}

Game.system.isNPC = function (e) {
  for (const keyValue of Game.entities.get('npc')) {
    if (e.getID() === keyValue[0]) {
      return true
    }
  }
  return false
}

Game.system.npcHere = function (x, y) {
  let npcFound = null
  let npcX = null
  let npcY = null

  for (const keyValue of Game.entities.get('npc')) {
    npcX = keyValue[1].Position.getX()
    npcY = keyValue[1].Position.getY()

    if (x === npcX && y === npcY) {
      npcFound = keyValue[1]
      break
    }
  }
  return npcFound
}

Game.system.pcHere = function (x, y) {
  let pc = Game.entities.get('pc')
  let pcX = pc.Position.getX()
  let pcY = pc.Position.getY()

  return x === pcX && y === pcY
    ? pc
    : null
}

Game.system.targetInSight = function (observer, sight, target) {
  let fov = Game.entities.get('dungeon').fov
  let obsX = observer.Position.getX()
  let obsY = observer.Position.getY()
  let targetX = null
  let targetY = null
  let targetFound = null

  let targetList = []

  if (Object.getPrototypeOf(target) === Map.prototype) {
    // target === Game.entities.get('npc')
    fov.compute(obsX, obsY, sight, function (x, y) {
      targetFound = Game.system.npcHere(x, y)
      targetFound && targetList.push(targetFound)
    })
  } else {
    targetX = target.Position.getX()
    targetY = target.Position.getY()

    fov.compute(obsX, obsY, sight, function (x, y) {
      if (x === targetX && y === targetY) {
        targetList.push(target)
      }
    })
  }

  return targetList.length > 0 ? targetList : null
}

Game.system.pcAct = function () {
  let pc = Game.entities.get('pc')

  Game.entities.get('timer').engine.lock()

  Game.system.updateStatus(pc)
  pc.FastMove.getFastMove() && Game.system.fastMove()

  Game.keyboard.listenEvent('add', 'main')
}

Game.system.move = function (direction, e, lockEngine) {
  let pos = e.Position
  let uiDungeon = Game.UI.dungeon
  let eDungeon = Game.entities.get('dungeon').Dungeon
  let dx = eDungeon.getDeltaX()
  let dy = eDungeon.getDeltaY()

  let duration = Game.system.updateAttribute('moveSpeed', e, null)
  let hasMoved = false

  let where = new Map()
  where.set('left', moveLeft)
  where.set('right', moveRight)
  where.set('up', moveUp)
  where.set('down', moveDown)
  where.set('wait', wait1Turn)

  if (e && e.Position && where.get(direction)) {
    where.get(direction)()

    if (hasMoved && !lockEngine) {
      Game.keyboard.listenEvent('remove', 'main')
      Game.system.unlockEngine(duration, e)
    }
  }
  return hasMoved

  function wait1Turn () {
    duration = 1
    hasMoved = true
  }

  function moveLeft () {
    if (Game.system.isWalkable(pos.getX() - 1, pos.getY(), e)) {
      pos.setX(pos.getX() - 1)

      Game.system.isPC(e) &&
        pos.getX() - dx <= eDungeon.getBoundary() &&
        dx >= 0 &&      // dx === -1, draw map border on the screen
        eDungeon.setDeltaX(dx - 1)

      hasMoved = true
    }
  }

  function moveRight () {
    if (Game.system.isWalkable(pos.getX() + 1, pos.getY(), e)) {
      pos.setX(pos.getX() + 1)

      Game.system.isPC(e) &&
        pos.getX() - dx >= uiDungeon.getWidth() - 1 - eDungeon.getBoundary() &&
        dx <= eDungeon.getWidth() - uiDungeon.getWidth() &&
        eDungeon.setDeltaX(dx + 1)

      hasMoved = true
    }
  }

  function moveUp () {
    if (Game.system.isWalkable(pos.getX(), pos.getY() - 1, e)) {
      pos.setY(pos.getY() - 1)

      Game.system.isPC(e) &&
        pos.getY() - dy <= eDungeon.getBoundary() &&
        dy >= 0 &&
        eDungeon.setDeltaY(dy - 1)

      hasMoved = true
    }
  }

  function moveDown () {
    if (Game.system.isWalkable(pos.getX(), pos.getY() + 1, e)) {
      pos.setY(pos.getY() + 1)

      Game.system.isPC(e) &&
        pos.getY() - dy >= uiDungeon.getHeight() - 1 - eDungeon.getBoundary() &&
        dy <= eDungeon.getHeight() - uiDungeon.getHeight() &&
        eDungeon.setDeltaY(dy + 1)

      hasMoved = true
    }
  }
}

// refer: Game.system.pcAct
Game.system.fastMove = function (direction, e) {
  let who = e || Game.entities.get('pc')
  let whoFast = who.FastMove
  let npc = Game.entities.get('npc')

  whoFast.setFastMove(true)
  direction && whoFast.setDirection(direction)

  if (Game.system.isPC(who) &&
    Game.system.targetInSight(who, who.Position.getSight(), npc)) {
    resetFastMove()
  } else if (!(whoFast.getCurrentStep() <= whoFast.getMaxStep() &&
    whoFast.setCurrentStep(whoFast.getCurrentStep() + 1) &&
    Game.system.move(whoFast.getDirection(), who))) {
    resetFastMove()
  }

  function resetFastMove () {
    whoFast.setFastMove(false)
    whoFast.setCurrentStep(0)
    whoFast.setDirection(null)
  }
}

/* How to add a spell
 * 1. keyboard input --> trigger action
 *    + keyboard: Game.screens.main.keyInput
 *    + action: Game.system.pcCast
 * 2. gain status:
 *    + text: Game.text.buff, Game.text.debuff
 *    + duration: Game.Component.Duration
 * 3. change related attributes if the stautus is active
 *    + changed value: Game.Component.ModAttribute
 *    + related attributes: Game.system.updateAttribute
 * 4. add description:
 *    + text: Game.text.pcStatus
 *    + print text: Game.system.pcCast
 */
Game.system.pcCast = function (spellID) {
  let pc = Game.entities.get('pc')
  let range = Game.entities.get('data').Range
  let mainScreen = Game.screens.main
  let drawMsg = Game.screens.drawMessage

  let spellLevel = Number.parseInt(spellID.match(/\d$/)[0])
  let duration = Game.system.updateAttribute('castSpeed', pc).get(spellLevel)

  let spellMap = new Map()
  spellMap.set('atk1', attack1)
  spellMap.set('atk2', attack2)

  spellMap.set('enh1', enhance1)
  spellMap.set('enh2', enhance2)

  spellMap.set('spc1', special1)
  spellMap.set('spc2', special2)

  spellMap.get(spellID) && spellMap.get(spellID)()

  function attack1 () {
    mainScreen.setMode('aim', Game.text.spellName('atk1'))
    Game.keyboard.listenEvent('remove', 'main')
    Game.system.exploreMode(dealDamage, range.getRange('atk1'), true)

    function dealDamage (target) {
      Game.system.updateCombatMsg(Game.system.hitTarget(pc, target), target)

      Game.system.unlockEngine(duration, pc)
    }
  }

  function attack2 () {
    mainScreen.setMode('aim', Game.text.spellName('atk2'))
    Game.keyboard.listenEvent('remove', 'main')
    Game.system.exploreMode(dealDamage, range.getRange('atk2'), true)

    function dealDamage (target) {
      Game.system.updateCombatMsg(
        Game.system.hitTarget(pc, target, false, maxOf2), target)

      Game.system.unlockEngine(duration, pc)
    }

    function maxOf2 (roll1) {
      let roll2 = ROT.RNG.getPercentage() - 30
      return Math.max(roll1, roll2)
    }
  }

  function enhance1 () {
    let moveBuff = false

    if (pc.HitPoint.getHP()[1] < pc.HitPoint.getMax()) {
      pc.HitPoint.gainHP(pc.HitPoint.getMax())
      moveBuff = pc.Status.gainStatus('buff', 'mov0', duration)

      pc.HitPoint.getHP()[1] < pc.HitPoint.getMax()
        ? moveBuff
          ? drawMsg(Game.text.pcStatus('healMove'))
          : drawMsg(Game.text.pcStatus('heal'))
        : moveBuff
          ? drawMsg(Game.text.pcStatus('heal2MaxMove'))
          : drawMsg(Game.text.pcStatus('heal2Max'))

      Game.keyboard.listenEvent('remove', 'main')
      Game.system.unlockEngine(duration, pc)
    } else {
      drawMsg(Game.text.pcStatus('maxHP'))
    }
  }

  function enhance2 () {
    let acted = false

    if (pc.Status.getStatus('debuff').size > 0) {
      let maxTurn = Math.min(4, 1 + pc.Status.getStatus('debuff').size)
      acted = pc.Status.gainStatus('buff', 'acc0', duration, maxTurn)
    }

    if (acted) {
      drawMsg(Game.text.pcStatus('lucky'))

      Game.keyboard.listenEvent('remove', 'main')
      Game.system.unlockEngine(duration, pc)
    } else {
      drawMsg(Game.text.pcStatus('unlucky'))
    }
  }

  function special1 () {
    switch (pc.ActorName.getTrueName()) {
      case 'dio':
        return dio1()
      case 'hulk':
        return hulk1()
      case 'lasombra':
        return lasombra1()
    }

    function dio1 () {
      mainScreen.setMode('aim', Game.text.spellName('dio1'))
      Game.keyboard.listenEvent('remove', 'main')
      Game.system.exploreMode(dealDamage, range.getRange('dio1'), true)

      function dealDamage (target) {
        Game.system.updateCombatMsg(
          Game.system.hitTarget(pc, target, false, maxOf2), target)

        Game.system.unlockEngine(duration, pc)
      }

      function maxOf2 (roll1) {
        let roll2 = ROT.RNG.getPercentage()
        return Math.max(roll1, roll2)
      }
    }

    function hulk1 () {
      let acted = false
      // cast the spell if at least one buff is added
      acted = pc.Status.gainStatus('buff', 'acc1', duration)
      pc.Status.gainStatus('buff', 'def1', duration)

      if (acted) {
        drawMsg(Game.text.pcStatus('puppet'))

        Game.keyboard.listenEvent('remove', 'main')
        Game.system.unlockEngine(duration, pc)
      } else {
        drawMsg(Game.text.pcStatus('maxBuff'))
      }
    }

    function lasombra1 () {

    }
  }

  function special2 () {
    switch (pc.ActorName.getTrueName()) {
      case 'dio':
        return dio2()
      case 'hulk':
        return hulk2()
      case 'lasombra':
        return lasombra2()
    }

    function dio2 () {
      let acted = false
      let npcAround = Game.system.aroundActor(Game.system.npcHere)
      let thisNPC = null

      if (npcAround.length === 0) {
        drawMsg(Game.text.combat('noNPCaround'))
      } else {
        for (let i = 0; i < npcAround.length; i++) {
          thisNPC = Game.system.npcHere(npcAround[i][0], npcAround[i][1])

          Game.system.updateCombatMsg(
            Game.system.hitTarget(pc, thisNPC, false, lowerAccuracy), thisNPC)
        }
        acted = true
      }

      if (acted) {
        Game.keyboard.listenEvent('remove', 'main')
        Game.system.unlockEngine(duration, pc)
      }

      function lowerAccuracy (roll1) {
        return roll1 - 10
      }
    }

    function hulk2 () {
      let acted = false
      acted = pc.Status.gainStatus('buff', 'cst1', duration)

      if (acted) {
        drawMsg(Game.text.pcStatus('castFaster'))

        Game.keyboard.listenEvent('remove', 'main')
        Game.system.unlockEngine(duration, pc)
      } else {
        drawMsg(Game.text.pcStatus('maxBuff'))
      }
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
Game.system.updateAttribute = function (attrID, actor, inputData) {
  let duration = Game.entities.get('data').Duration
  let modAttr = Game.entities.get('data').ModAttribute
  let attrMap = new Map()

  attrMap.set('moveSpeed', moveSpeed)
  attrMap.set('accuracy', accuracy)
  attrMap.set('defense', defense)
  attrMap.set('castSpeed', castSpeed)
  attrMap.set('damage', damage)

  return attrID && attrMap.get(attrID) && actor && actor.Status
    ? attrMap.get(attrID)(inputData)
    : null

  function moveSpeed () {
    return duration.getMove() - modAttr.getMod('buff', 'mov0',
      actor.Status.isActive('buff', 'mov0'))
  }

  function accuracy () {
    return actor.Combat
      ? actor.Combat.getAccuracy() +
      modAttr.getMod('buff', 'acc1',
        actor.Status.isActive('buff', 'acc1')) +
      modAttr.getMod('buff', 'acc0',
        actor.Status.isActive('buff', 'acc0')) -
      modAttr.getMod('debuff', 'acc0',
        actor.Status.isActive('debuff', 'acc0'))
      : 0
  }

  function defense () {
    return actor.Combat
      ? actor.Combat.getDefense() +
      modAttr.getMod('buff', 'def1',
        actor.Status.isActive('buff', 'def1')) -
      modAttr.getMod('debuff', 'def0',
        actor.Status.isActive('debuff', 'def0'))
      : 0
  }

  function castSpeed () {
    let level1 = duration.getSpell(1)
    let level2 = duration.getSpell(2)
    let level3 = duration.getSpell(3)

    let buff = modAttr.getMod('buff', 'cst1',
      actor.Status.isActive('buff', 'cst1'))

    return new Map([
      [1, level1 - buff],
      [2, level2 - buff],
      [3, level3]
    ])
  }

  function damage (inputData) {
    let debuff = modAttr.getMod('debuff', 'dmg0',
      actor.Status.isActive('debuff', 'dmg0'))

    console.log(debuff)
    console.log(inputData)
    return debuff === 0
      ? inputData
      : Math.floor(inputData * debuff)
  }
}

Game.system.exploreMode = function (callback, range) {
  let marker = Game.entities.get('marker')
  let markerPos = marker.Position
  let pc = Game.entities.get('pc')
  let npc = Game.entities.get('npc')
  let pcPos = pc.Position
  let action = Game.keyboard.getAction
  let pcHere = Game.system.pcHere
  let npcHere = Game.system.npcHere
  let mainScreen = Game.screens.main
  let description = Game.entities.get('record').Description

  let saveSight = pcPos.getSight()
  let spacePressed = false
  let escPressed = false
  let targetFound = null

  markerPos.setX(pcPos.getX())
  markerPos.setY(pcPos.getY())
  Number.isInteger(range) && range >= 0 && pcPos.setSight(range)

  let targetList = Game.system.targetInSight(pc, pcPos.getSight(), npc) || []
  sortTarget()

  if (mainScreen.getMode() === 'main') {
    mainScreen.setMode('explore', Game.text.modeLine('range') + getRange())
  }

  Game.keyboard.listenEvent('remove', 'main')
  Game.keyboard.listenEvent('add', moveMarker)

  function moveMarker (e) {
    if (e.shiftKey) {
      if (action(e, 'fastMove')) {
        for (let i = 0; i < pcPos.getSight(); i++) {
          if (!Game.system.move(action(e, 'fastMove'), marker, true)) { break }
        }
      }
    } else if (action(e, 'move')) {
      Game.system.move(action(e, 'move'), marker, true)
    } else if (action(e, 'pause') === 'nextTarget') {
      lockTarget(action(e, 'pause'))
    } else if (action(e, 'pause') === 'previousTarget') {
      lockTarget(action(e, 'pause'))
    } else if (action(e, 'fixed') === 'space') {
      switch (mainScreen.getMode()) {
        case 'explore':
          if (Game.getDevelop()) {
            targetFound = pcHere(markerPos.getX(), markerPos.getY()) ||
              npcHere(markerPos.getX(), markerPos.getY())
            targetFound && Game.system.printActorData(targetFound)
          }
          break
        case 'aim':
          targetFound = npcHere(markerPos.getX(), markerPos.getY())
          spacePressed = targetFound !== null
          break
      }
    } else if (action(e, 'fixed') === 'esc') {
      escPressed = true
      // testing
    } else if (Game.getDevelop()) {
      if (e.key === 'd') {
        Game.system.createDummy()
      }
    }

    if (spacePressed || escPressed) {
      markerPos.setX(null)
      markerPos.setY(null)
      pcPos.setSight(saveSight)
      mainScreen.setMode('main')
    }

    mainScreen.getMode() === 'explore' &&
      mainScreen.setMode('explore', Game.text.modeLine('range') + getRange())
    updateDescription()

    Game.display.clear()
    mainScreen.display()
    description.reset()

    if (spacePressed) {
      Game.keyboard.listenEvent('remove', moveMarker)
      callback.call(callback, targetFound)
    } else if (escPressed) {
      Game.keyboard.listenEvent('remove', moveMarker)
      Game.keyboard.listenEvent('add', 'main')
    }
  }

  function updateDescription () {
    if (!npcHere(markerPos.getX(), markerPos.getY())) {
      return false
    }

    let npc = npcHere(markerPos.getX(), markerPos.getY())
    let challengeRate = getChallengeRate(npc)
    let hitpoint = getHitPoint(npc.HitPoint.getHPfraction())

    description.setFlavor(Game.text.actor(npc.ActorName.getTrueName()))
    description.setDogTag(npc.ActorName.getStageName() +
      '|' + hitpoint +
      '|' + challengeRate)

    return true
  }

  function getHitPoint (fraction) {
    let text = null
    let color = null
    let hpDescription = Game.text.combat('hitpoint')

    if (fraction === 10) {
      text = hpDescription.get(fraction)
    } else if (fraction > 7) {
      text = hpDescription.get(7)
      color = 'green'
    } else if (fraction > 3) {
      text = hpDescription.get(3)
      color = 'yellow'
    } else if (fraction > 0) {
      text = hpDescription.get(0)
      color = 'red'
    } else if (fraction === 0) {
      text = hpDescription.get(-1)
      color = 'grey'
    }

    return Game.screens.colorfulText(text, color)
  }

  function getChallengeRate (e) {
    let color = null
    let cr = Math.max(-2,
      Math.min(3,
        e.Level.getLevel() - Game.entities.get('pc').Curse.getPClevel()))

    color = cr === 1
      ? 'yellow'
      : cr > 1
        ? 'red'
        : 'white'

    return Game.screens.colorfulText(Game.text.combat('level').get(cr), color)
  }

  function getRange () {
    let x = Math.abs(markerPos.getX() - pcPos.getX())
    let y = Math.abs(markerPos.getY() - pcPos.getY())

    return Math.max(x, y)
  }

  function sortTarget () {
    if (!targetList.length) {
      return false
    }

    targetList.sort((left, right) => {
      let pcX = pcPos.getX()
      let leftX = left.Position.getX()
      let leftY = left.Position.getY()
      let rightX = right.Position.getX()
      let rightY = right.Position.getY()

      if (leftX > pcX && rightX > pcX) {
        if (leftX > rightX) {
          return true
        } else if (leftX === rightX) {
          return leftY > rightY
        } else {
          return false
        }
      } else if (leftX <= pcX && rightX <= pcX) {
        if (leftX > rightX) {
          return false
        } else if (leftX === rightX) {
          return leftY < rightY
        } else {
          return true
        }
      } else {
        return leftX < rightX
      }
    })

    return true
  }

  function lockTarget (order) {
    let nextIndex = 0
    let previousIndex = targetList.length - 1

    if (previousIndex < 0) {
      return false
    }

    for (let i = 0; i < targetList.length; i++) {
      if (targetList[i].Position.getX() === markerPos.getX() &&
        targetList[i].Position.getY() === markerPos.getY()) {
        nextIndex = i + 1 < targetList.length
          ? i + 1
          : 0
        previousIndex = i - 1 > -1
          ? i - 1
          : targetList.length - 1
      }
    }

    switch (order) {
      case 'nextTarget':
        markerPos.setX(targetList[nextIndex].Position.getX())
        markerPos.setY(targetList[nextIndex].Position.getY())
        return true
      case 'previousTarget':
        markerPos.setX(targetList[previousIndex].Position.getX())
        markerPos.setY(targetList[previousIndex].Position.getY())
        return true
    }
  }
}

Game.system.createDummy = function () {
  let x = Game.entities.get('marker').Position.getX()
  let y = Game.entities.get('marker').Position.getY()

  let id = Game.entity.npc('Dummy', 'dmy', 'D', 'white', 1)
  let e = Game.entities.get('npc').get(id)

  e.Position.setX(x)
  e.Position.setY(y)
  e.HitPoint.setMax(48)
  e.Combat.setDefense(70)
}

Game.system.printActorData = function (e) {
  e.print()
  for (const [key, value] of e.Status.getStatus('buff')) {
    console.log('[+' + key + '] Max:' + value[0] +
      ', Start:' + Number.parseFloat(value[1]).toFixed(1))
  }
  for (const [key, value] of e.Status.getStatus('debuff')) {
    console.log('[-' + key + '] Max:' + value[0] +
      ', Start:' + Number.parseFloat(value[1]).toFixed(1))
  }
}

Game.system.unlockEngine = function (duration, e) {
  Game.system.isPC(e) && e.ActorClock.setLastAction(duration)

  Game.entities.get('timer').scheduler.setDuration(duration)
  Game.entities.get('timer').engine.unlock()

  Game.display.clear()
  Game.screens.main.display()
}

Game.system.rollDx = function (min, max) {
  return Math.floor(ROT.RNG.getUniform() * (max - min + 1)) + min
}

Game.system.rollD20 = function () {
  return Game.system.rollDx(1, 20)
}

Game.system.hitTarget = function (attacker, defender, noDamage, reroll) {
  let update = Game.system.updateAttribute
  let accuracy = update('accuracy', attacker)
  let defense = update('defense', defender)
  let delta = 0
  let critical = -1
  let modDmg = 0

  let combatRoll = ROT.RNG.getPercentage()

  if (reroll) { combatRoll = reroll(combatRoll) }
  delta = combatRoll + accuracy - defense

  // console.log(combatRoll)
  // console.log(accuracy)
  // console.log(defense)

  if (delta > 0) {
    critical = Math.floor(delta / 30)
    if (!noDamage) {
      modDmg = update('damage', attacker,
        attacker.Combat.getDamage(critical, true))
      defender.HitPoint.loseHP(modDmg)
    }
  }
  return critical
}

Game.system.isDead = function (e) {
  let who = null

  if (e.HitPoint.getHP()[1] >= 1) {
    return who
  }

  if (Game.system.isNPC(e)) {
    Game.entities.get('npc').delete(e.getID())
    who = 'npc'
  }

  return who
}

Game.system.updateCombatMsg = function (hit, target, isNotDamage) {
  let record = Game.entities.get('record').Message

  if (hit > 0) {
    record.gainMessage(Game.text.combat('pcCrit', target))
  } else if (hit === 0) {
    record.gainMessage(Game.text.combat('pcHit', target))
  } else {
    record.gainMessage(Game.text.combat('pcMiss', target))
  }

  Game.system.isDead(target) === 'npc' &&
    record.gainMessage(Game.text.combat('npcIsDead', target))
}

Game.system.aroundActor = function (callback, actor, maxActors) {
  let pos = (actor && actor.Position) || Game.entities.get('pc').Position
  let x = pos.getX()
  let y = pos.getY()
  let checkList = []
  let special = []
  let max = maxActors || 4    // 4 or 8

  if (max === 4) {
    checkList = [[x + 1, y], [x, y + 1], [x - 1, y], [x, y - 1]]

    for (let i = 0; i < checkList.length; i++) {
      if (callback.call(callback, checkList[i][0], checkList[i][1])) {
        special.push(checkList[i])
      }
    }
  }
  return special
}
