'use strict'

Game.entity = {}
Game.entity.collection = new Map()

// Game.entities.create.ball = function () {
//   Game.entities.ball = new Game.Entity('ball')
//   Game.entities.ball.addComponent(new Game.Components.Shape(10))
//   Game.entities.ball.addComponent(new Game.Components.Position(
//     Game.canvas.getWidth() / 2, Game.canvas.getHeight() - 30))
//   Game.entities.ball.addComponent(new Game.Components.Shift(
//     (Math.random() > 0.5 ? 1 : -1) * 2, (Math.random() > 0.5 ? 1 : -1) * 2))
//   Game.entities.mapList.get('movable').push(Game.entities.ball)
// }
