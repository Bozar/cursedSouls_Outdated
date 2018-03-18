'use strict'

Game.system = {}

Game.system.feedRNG = function (e) {
  e && e.Seed && feed(verify())

  function feed (seed) {
    seed
      ? (function () {
        let rndList = []

        ROT.RNG.setSeed(seed)
        for (let i = 0; i < 5; i++) { rndList.push(ROT.RNG.getUniform()) }

        Game.getDevelop() && console.log(Game.text.devNote('rng') +
          JSON.stringify(rndList, null, 2))
      }())
      : Game.getDevelop() && console.log(Game.text.devError('seed'))
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

Game.system.updateCurse = function (what, e) {
  e && e.Curse && update()

  function update () {
    switch (what) {
      case 'gain':
        gainCurse()
        break
      case 'lose':
        e.Curse.getCurse().pop()
        break
    }
    Game.screens.clearBlock(Game.UI.curse)
    Game.screens.drawCurse()
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

Game.system.updateLevel = function (point, e) {
  e && e.Curse && update()

  function update () {
    e.Curse.getPoint() + point >= e.Curse.getMaxPoint()
      ? overMax()
      : e.Curse.getPoint() + point >= 0
        ? e.Curse.gainPoint(point)
        : belowZero()

    Game.screens.clearBlock(Game.UI.cl)
    Game.screens.drawLevelBar()
  }

  function overMax () {
    e.Curse.setPoint(e.Curse.getPoint() + point - e.Curse.getMaxPoint())
    Game.system.updateCurse('gain', e)
  }

  function belowZero () {
    e.Curse.setPoint(e.Curse.getPoint() + point + e.Curse.getMaxPoint())
    Game.system.updateCurse('lose', e)
  }
}

Game.system.gainHP = function (e, maxHP) {
  e && e.HitPoint && maxHP && heal()

  function heal () {
    let healed = e.HitPoint.getHP()[1] + Math.floor(maxHP / 4)

    healed = Math.min(healed, maxHP)
    e.HitPoint.getHP().push(healed)
    e.HitPoint.getHP().shift()

    Game.screens.clearBlock(Game.UI.hp)
    Game.screens.drawHPBar()
  }
}

Game.system.loseHP = function (e, damage) {
  e && e.HitPoint && damage && takeDamage()

  function takeDamage () {
    let afterHit = e.HitPoint.getHP()[1] - damage

    e.HitPoint.getHP().push(Math.max(0, afterHit))
    e.HitPoint.getHP().shift()

    Game.screens.clearBlock(Game.UI.hp)
    Game.screens.drawHPBar()
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

Game.system.isWalkable = function (e, x, y) {
  return e && e.Dungeon
    ? verify()
    : false

  function verify () {
    return e.Dungeon.getTerrain().get(x + ',' + y) === 0
  }
}

Game.system.isPC = function (e) {
  return e && e.ActorName
    ? verify()
    : false

  function verify () {
    let trueName = ['dio', 'hulk', 'lasombra']

    return trueName.indexOf(e.ActorName.getTrueName()) > -1
  }
}

Game.system.pcAct = function () {
  Game.entities.get('timer').engine.lock()

  Game.keyboard.listenEvent('add', 'main')
}
