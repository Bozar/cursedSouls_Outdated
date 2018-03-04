'use strict'

Game.text = {}

Game.text.selectClass = function (choice) {
  switch (choice) {
    case 'dio':
      return '\nYour choice: Striker'
    case 'hulk':
      return '\nYour choice: Enhancer'
    case 'lasombra':
      return '\nYour choice: Controller'
    default:    // initial screen
      return `Please read the manual.\n\nChoose your class:\
\n\nA. Striker    (Easy)\nB. Enhancer   (Normal)\nC. Controller (Hard)`
  }
}

Game.text.describeSeed = function () {
  return `Enter your seed:\n\n\
* No more than 15 case-insensitive alphabets\n\
* Leave blank for a random seed\n\n[               ]`
}

Game.text.confirmDecision = function () {
  return `Would you like to continue?`
}

Game.text.prologue = function (choice) {
  let text = `You find yourself lying on the moist ground, \
like a nameless body in the morgue, who is neither known to anyone in life, \
nor in death. Sea of shadows surrounds you. Weepings and whispers, \
as gentle as a breeze, blows in your mind.\n\n`

  let dio = `choose striker`
  let hulk = `choose enhancer`
  let lasombra = `choose controller`

  switch (choice) {
    case 'dio':
      return (text += dio)
    case 'hulk':
      return (text += hulk)
    case 'lasombra':
      return (text += lasombra)
  }
}

Game.text.modeLine = function (mode) {
  switch (mode) {
    case 'select':
      return 'Press a, b or c'
    case 'enter':
      return 'Press Enter to confirm'
    case 'backspace':
      return ', Backspace to delete'
    case 'yesNoLower':
      return 'Press y or n'
  }
}

Game.text.dev = function (error) {
  switch (error) {
    case 'mode':
      return `ERROR: Mode undefined!\nCurrent screen: ` +
        Game.screens._currentName + `.`
    case 'seed':
      return `ERROR: Invalid seed: ` + Game.getSeed() + `.`
  }
}
