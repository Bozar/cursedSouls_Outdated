'use strict'

Game.Component = {}

Game.Component.DungeonSize = function (width, height, depth) {
  this._name = 'DungeonSize'

  this._width = width
  this._height = height
  this._depth = depth || 1
}
