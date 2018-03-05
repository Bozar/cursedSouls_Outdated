'use strict'

Game.text = {}

Game.text.selectClass = function (choice) {
  let text = new Map()

  text.set('initial', `Please read the manual.\n\nChoose your class:\
\n\nA. Striker    (Easy)\nB. Enhancer   (Normal)\nC. Controller (Hard)`)

  text.set('dio', '\nYour choice: Striker')
  text.set('hulk', '\nYour choice: Enhancer')
  text.set('lasombra', '\nYour choice: Controller')

  return text.get(choice)
}

Game.text.enterSeed = function (when) {
  let text = new Map()

  text.set('enter', `Enter your seed:\n\n\
* No more than 15 case-insensitive alphabets\n\
* Leave blank for a random seed\n\n[               ]`)

  text.set('confirm', 'Would you like to continue?')

  return text.get(when)
}

Game.text.prologue = function (choice) {
  let text = new Map()

  text.set('para1', `You find yourself lying on the moist ground, \
like a nameless body in the morgue, who is neither known to anyone in life, \
nor in death. Sea of shadows surrounds you. Weepings and whispers, \
as gentle as a breeze, blows in your mind.\n\n`)

  text.set('dio', `choose striker`)
  text.set('hulk', `choose enhancer`)
  text.set('lasombra', `choose controller`)

  return text.get('para1') + text.get(choice)
}

Game.text.spell = function (pcClass, level) {

}

Game.text.modeLine = function (mode) {
  let text = new Map()

  text.set('select', 'Press a, b or c')
  text.set('space', 'Press Space to continue')
  text.set('enter', 'Press Enter to confirm')
  text.set('backspace', ', Backspace to delete')
  text.set('yesNoLower', 'Press y or n')

  return text.get(mode)
}

Game.text.devError = function (error) {
  let text = new Map()

  text.set('mode',
    'Mode undefined!\nCurrent screen: ' + Game.screens._currentName + '.')
  text.set('seed', 'Invalid seed: ' + Game.getSeed() + '.')
  text.set('browser', 'Rot.js is not supported by your browser.')
  text.set('message', 'Game.screens.drawMessage() has no argument.')

  return '[Error] ' + text.get(error)
}

Game.text.devNote = function (note) {
  let text = new Map()

  text.set('rng', 'RNG start: ')

  return '[Note] ' + text.get(note)
}
