'use strict'

// ----- Store entities +++++
Game.entities = new Map()
Game.entities.set('dungeon', null)
Game.entities.set('seed', null)
Game.entities.set('pc', null)

// ----- Create a single entity +++++
Game.entity = {}

Game.entity.dungeon = function (width, height) {
  let e = new Game.Factory('dungeon')
  e.addComponent(new Game.Component.Dungeon(width, height))

  cellular()
  Game.entities.set('dungeon', e)

  function cellular () {
    let cell = new ROT.Map.Cellular(e.Dungeon._width, e.Dungeon._height)

    cell.randomize(0.5)
    for (let i = 0; i < 5; i++) { cell.create() }
    cell.connect(function (x, y, wall) {
      e.Dungeon._terrain.set(x + ',' + y, wall)
    })
  }
}

Game.entity.seed = function () {
  let e = new Game.Factory('seed')
  e.addComponent(new Game.Component.Seed())

  Game.entities.set('seed', e)
}

Game.entity.pc = function () {
  let e = new Game.Factory('pc')

  e.addComponent(new Game.Component.ActorName('Nameless One', null))
  e.addComponent(new Game.Component.Display('@'))
  e.addComponent(new Game.Component.Curse())
  e.addComponent(new Game.Component.HitPoint(64))
  e.addComponent(new Game.Component.Buff())

  // Map {buffID => Map {buffID ==> turn}}
  e.Buff.gainStatus(new Game.Component.Status('+acc', 3))
  e.Buff.gainStatus(new Game.Component.Status('+def', 3))
  e.Buff.gainStatus(new Game.Component.Status('+imm', 3))
  e.Buff.gainStatus(new Game.Component.Status('+mov', 1.5))
  e.Buff.gainStatus(new Game.Component.Status('+spl', 5))

  Game.entities.set('pc', e)
}
