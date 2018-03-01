'use strict'

Game.text = {}

Game.text.prologue = function (choice) {
  let text = `You find yourself lying on the moist ground, \
like a nameless body in the morgue, who is neither known to anyone in life, \
nor in death. Sea of shadows surrounds you. Weepings and whispers, \
as gentle as a breeze, blows in your mind.\n\n`

  let striker = `choose striker`
  let enhancer = `choose enhancer`
  let controller = `choose controller`

  switch (choice) {
    case 'chooseA':
      text += striker
      break
    case 'chooseB':
      text += enhancer
      break
    case 'chooseC':
      text += controller
      break
  }

  return text
}
