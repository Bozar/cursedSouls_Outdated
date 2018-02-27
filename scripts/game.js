'use strict'

var Game = {}
Game.version = '0.0.1-dev'

Game.ui = {}

Game.ui.canvas = {}
Game.ui.canvas._width = 70
Game.ui.canvas._height = 25
Game.ui.canvas._fontSize = 20
Game.ui.canvas._fontFamily = 'dejavu sans mono'
Game.ui.canvas._fontFamily += ', consolas'
Game.ui.canvas._fontFamily += ', monospace'

Game.ui.stat = {}
Game.ui.stat._width = 20

Game.ui.message = {}
// 2.5 = 1(padding-left) + 1(padding-right) + 0.5(margin(message-stat))
Game.ui.message._width = Game.ui.canvas._width - Game.ui.stat._width - 2.5
Game.ui.message._height = 5
Game.ui.message._msgList = (function () {
  let emptyList = new Array(Game.ui.message._height)
  for (let i = 0; i < emptyList.length; i++) {
    emptyList[i] = ''
  }
  return emptyList
}())

Game.ui.message.add = function (msg) {
  let updatedMsg = Game.ui.message._msgList.slice(
    Math.ceil(msg.length / Game.ui.message._width))

  updatedMsg.push(msg)
  Game.ui.message._msgList = updatedMsg
}

Game.ui.message.print = function () {
  let msgList = Game.ui.message._msgList

  for (let i = 0; i < msgList.length; i++) {
    Game.display.drawText(
      1,
      Game.ui.canvas._height - Game.ui.message._height - 1.5 + i,
      msgList[i],
      Game.ui.message._width)
  }
}

Game.display = new ROT.Display({
  width: Game.ui.canvas._width,
  height: Game.ui.canvas._height,
  fontSize: Game.ui.canvas._fontSize,
  fontFamily: Game.ui.canvas._fontFamily
})

// ===== Test =====
Game.test = {}
Game.test.upper = function (text) {
  return text.toUpperCase()
}

// ===== Test End =====

window.onload = function () {
  if (!ROT.isSupported()) {
    window.alert('Rot.js is not supported by your browser.')
    return
  }
  document.getElementById('game').appendChild(Game.display.getContainer())

  Game.display.drawText(70 - 0.5 - Game.version.length, 0.5, Game.version, '#619DD8')
  Game.display.drawText(5, 3, '1234567890', '#619DD8')
  Game.display.draw(5, 4, '@', '#619DD8', 'red')
  Game.display.drawText(5, 5, '%c{green}hello%c{} world,')
  Game.display.drawText(5, 6,
    `%c{yellow}%b{grey}great%b{} ${Game.test.upper('hero')}%c{}!`, 6)

  Game.display.drawText(1, Game.ui.canvas._height - 7.5, 'top')
  Game.display.drawText(1, Game.ui.canvas._height - 1.5, 'bottom')
  Game.ui.message.add('123456789')
  Game.ui.message.add('1234567890#')
  Game.ui.message.add('12345678901#')
  Game.ui.message.add('123456789012#')
  Game.ui.message.add('1234567890123#')
  Game.ui.message.add('12345678901234567890123456789012345678901234567890#')
  Game.ui.message.print()
}
