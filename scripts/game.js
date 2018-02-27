'use strict'

var Game = {}
Game.version = '0.0.1-dev'
Game.display = new ROT.Display({ width: 50, height: 28, fontSize: 22 })

Game.upper = function (text) {
  return text.toUpperCase()
}

window.onload = function () {
  if (!ROT.isSupported()) {
    window.alert('rot.js is not supported by your browser.')
    return
  }
  document.getElementById('game').appendChild(Game.display.getContainer())

  Game.display.drawText(5, 3, '1234567890', '#619DD8')
  Game.display.draw(5, 4, '@', '#619DD8', 'red')
  Game.display.drawText(5, 5, '%c{green}hello%c{} world,')
  Game.display.drawText(5, 6,
    `%c{yellow}%b{grey}great%b{} ${Game.upper('hero')}%c{}`, 6)
  Game.display.drawText(4, 26, '@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@0', 20)
}
