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
