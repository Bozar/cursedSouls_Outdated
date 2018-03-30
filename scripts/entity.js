'use strict'

// ----- Store entities +++++
Game.entities = new Map()
Game.entities.set('dungeon', null)
Game.entities.set('seed', null)
Game.entities.set('timer', null)
Game.entities.set('data', null)
Game.entities.set('pc', null)
Game.entities.set('npc', new Map())
Game.entities.set('marker', null)
Game.entities.set('record', null)

// ----- Create a single entity +++++
Game.entity = {}

Game.entity.dungeon = function (width, height) {
  let e = new Game.Factory('dungeon')
  e.addComponent(new Game.Component.Dungeon(width, height))

  cellular()

  e.light = function (x, y) {
    return e.Dungeon.getTerrain().get(x + ',' + y) === 0
  }
  e.fov = new ROT.FOV.PreciseShadowcasting(e.light)

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

Game.entity.timer = function () {
  let e = new Game.Factory('timer')

  e.scheduler = new ROT.Scheduler.Action()
  e.engine = new ROT.Engine(e.scheduler)

  Game.entities.set('timer', e)
}

Game.entity.data = function () {
  let e = new Game.Factory('data')

  e.addComponent(new Game.Component.Duration())
  e.addComponent(new Game.Component.Range())
  e.addComponent(new Game.Component.ModAttribute())

  Game.entities.set('data', e)
}

Game.entity.pc = function () {
  let e = new Game.Factory('pc')

  e.addComponent(new Game.Component.ActorName('Nameless One', null))
  e.addComponent(new Game.Component.Position(6))
  e.addComponent(new Game.Component.FastMove())
  e.addComponent(new Game.Component.Display('@'))
  e.addComponent(new Game.Component.Curse())
  e.addComponent(new Game.Component.HitPoint(64))
  e.addComponent(new Game.Component.Combat(5, 14, 12))
  e.addComponent(new Game.Component.ActorClock())
  e.addComponent(new Game.Component.Status())

  e.act = Game.system.pcAct

  Game.entities.set('pc', e)
}

Game.entity.npc = function (stageName, trueName, char, fgColor) {
  let e = new Game.Factory(trueName)

  e.addComponent(new Game.Component.ActorName(stageName, trueName))
  e.addComponent(new Game.Component.Position(6))
  e.addComponent(new Game.Component.Display(char, fgColor))
  e.addComponent(new Game.Component.HitPoint())
  e.addComponent(new Game.Component.Combat())
  e.addComponent(new Game.Component.Status())

  // e.act = Game.system[trueName + 'Act']

  Game.entities.get('npc').set(e.getID(), e)
  return e.getID()
}

Game.entity.marker = function () {
  let e = new Game.Factory('marker')

  e.addComponent(new Game.Component.Display('X', 'orange'))
  e.addComponent(new Game.Component.Position())

  Game.entities.set('marker', e)
}

Game.entity.record = function () {
  let e = new Game.Factory('record')

  e.addComponent(new Game.Component.Message())
  e.addComponent(new Game.Component.Description())

  Game.entities.set('record', e)
}
