'use strict'

Game.text = {}

Game.text.prologue = function (choice) {
  let text = `You find yourself lying on the moist ground, \
like a nameless body in the morgue, who is neither known to anyone in life, \
nor in death. Sea of shadows surrounds you. Weepings and whispers, \
as gentle as a breeze, blows in your mind.\n\n`

  let dio = `choose striker`
  let hulk = `choose enhancer`
  let lasombra = `choose controller`

  switch (choice) {
    case 'chooseA':
      text += dio
      break
    case 'chooseB':
      text += hulk
      break
    case 'chooseC':
      text += lasombra
      break
  }

  return text
}
