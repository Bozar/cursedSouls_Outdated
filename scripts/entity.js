'use strict'

Game.entity = {}
Game.entity.collection = new Map()
Game.entity.collection.set('dungeon', new Map())

// dungeon size only, without wall/floor position
// see Game.system.createDungeon
Game.entity.dungeon = function (width, height, depth) {
  let e = new Game.Factory('dungeon')
  e.addComponent(new Game.Component.DungeonSize(width, height, depth))

  return e
}
