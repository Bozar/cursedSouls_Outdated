'use strict'

Game.system = {}

// dungeon size & wall/floor position
Game.system.createDungeon = function (entity) {
  let e = entity ? entity.DungeonSize : null
  return (e && cellular())

  function cellular () {
    let cell = new ROT.Map.Cellular(e._width, e._height)

    cell.randomize(0.5)
    for (let i = 0; i < 5; i++) { cell.create() }
    cell.connect(function (x, y, wall) {
      Game.entity.collection.get('dungeon').set(x + ',' + y, wall)
    })

    return true
  }
}
