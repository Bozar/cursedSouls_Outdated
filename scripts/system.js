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
    Game.screens.drawLevelBar(
      Math.floor(e.Curse.getPoint() / e.Curse.getMaxPoint() * 10))
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

Game.system.gainHP = function (self, debuff) {
  self && self.HitPoint && debuff && debuff.HitPoint && heal()

  function heal () {
    let healed = self.HitPoint.getCurrent() + debuff.HitPoint.getHeal()
    let max = debuff.HitPoint.getMax()

    healed < max
      ? self.HitPoint.setCurrent(healed)
      : self.HitPoint.setCurrent(max)

    Game.screens.clearBlock(Game.UI.hp)
    Game.screens.drawHPBar(
      Math.floor(self.HitPoint.getCurrent() / self.HitPoint.getMax() * 10), 0)
  }
}

Game.system.loseHP = function (e, damage) {
  e && e.HitPoint && damage && takeDamage()

  function takeDamage () {
    let beforeHit = e.HitPoint.getCurrent()
    let afterHit = e.HitPoint.getCurrent() - damage

    afterHit > 0
      ? e.HitPoint.setCurrent(afterHit)
      : (function () {
        e.HitPoint.setCurrent(0)
        damage = beforeHit
      }())

    Game.screens.clearBlock(Game.UI.hp)
    Game.screens.drawHPBar(
      Math.floor(beforeHit / e.HitPoint.getMax() * 10),
      Math.floor(damage / e.HitPoint.getMax() * 10))
  }
}

Game.system.updateStatus = function (status, id, turn, e) {
  e && e[status] && e[status].getStatus(id) && update()

  function update () {
    let hasStatus = []

    e[status].getStatus(id).setCurrent(turn > e[status].getStatus(id).getMax()
      ? e[status].getStatus(id).getMax()
      : turn > 0
        ? turn
        : 0)

    Game.screens.clearBlock(Game.UI[status.toLowerCase()])

    for (const [key, value] of e[status].getStatus(null)) {
      value.getCurrent() > 0 && hasStatus.push(
        [Game.text.buff(key), value.getCurrent()])
    }
    Game.screens['draw' + status](hasStatus)
  }
}
