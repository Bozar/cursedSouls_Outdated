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

Game.system.gainHP = function (maxHP, e) {
  e && e.HitPoint && maxHP && heal()

  function heal () {
    let healed = e.HitPoint.getHP()[1] + Math.floor(maxHP / 4)

    healed = Math.min(healed, maxHP)
    e.HitPoint.getHP().push(healed)
    e.HitPoint.getHP().shift()
  }
}

Game.system.loseHP = function (damage, e) {
  e && e.HitPoint && damage && takeDamage()

  function takeDamage () {
    let afterHit = e.HitPoint.getHP()[1] - damage

    e.HitPoint.getHP().push(Math.max(0, afterHit))
    e.HitPoint.getHP().shift()
  }
}

Game.system.gainBuff = function (id, e) {
  id && e && e.Buff && gain()

  function gain () {
    e.Buff.gainStatus(Game.Component.buffLibrary(id))
  }
}

Game.system.gainDebuff = function (id, e) {
  id && e && e.Debuff && gain()

  function gain () {
    e.Debuff.gainStatus(Game.Component.debuffLibrary(id))
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
  Game.entities.get('timer').engine.lock()

  Game.keyboard.listenEvent('add', 'main')
}
