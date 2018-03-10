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

Game.Component.ActorName = function (stageN, trueN) {
  this._name = 'ActorName'

  this._stageName = stageN        // player can see
  this._trueName = trueN          // internal ID

  this.getStageName = function () { return this._stageName }
  this.getTrueName = function () { return this._trueName }
  this.setTrueName = function (name) { this._trueName = name }
}

Game.Component.Display = function (char, fgColor, bgColor) {
  this._name = 'Display'

  this._character = char | '烫'    // use '烫' for testing
  this._fgColor = fgColor | ''    // default: Game.display, '#abb2bf'
  this._bgColor = bgColor | ''    // default: Game.display, '#262626'

  this.getCharacter = function () { return this._character }
  this.getFgColor = function () { return this._fgColor }
  this.getBgColor = function () { return this._bgColor }

  this.setFgColor = function (color) { this._fgColor = color }
  this.setBgColor = function (color) { this._bgColor = color }
}

Game.Component.Curse = function () {
  this._name = 'Curse'

  this._cursedPoint = 0
  this._hasCurse = []

  this.getPoint = function () { return this._cursedPoint }
  this.getCurse = function () { return this._hasCurse }
  this.getLevel = function () { return Math.ceil(this._hasCurse.length / 2) }

  this.addPoint = function (point) { this._cursedPoint += point }
  this.setPoint = function (point) { this._cursedPoint = point }

  this.addCurse = function (curse) { this._hasCurse.push(curse) }
  this.removeCurse = function () { this._hasCurse.pop() }
}
