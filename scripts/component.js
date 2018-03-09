'use strict'

Game.Component = {}

Game.Component.Dungeon = function (width, height) {
  this._name = 'Dungeon'

  this._width = width
  this._height = height
  this._terrain = new Map()   // z,x,y: 0(floor) or 1(wall)
  this._deltaX = 0
  this._deltaY = 0

  this.getTerrain = function () { return this._terrain }

  this.getDeltaX = function () { return this._deltaX }
  this.getDeltaY = function () { return this._deltaY }
  this.setDeltaX = function (delta) { this._deltaX += delta }
  this.setDeltaY = function (delta) { this._deltaY += delta }
}

Game.Component.Seed = function () {
  this._name = 'Seed'

  this._seed = null

  this.getSeed = function () { return this._seed }
  this.setSeed = function (seed) {
    seed === ''
      ? this._seed =
      Math.floor((Math.random() * 9 + 1) * Math.pow(10, 4)).toString()
      : seed === null
      ? this._seed = null
      : this._seed = seed.toString()
  }
}
