'use strict'

Game.text = {}

// ----- the first screen +++++
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

// ----- the second screen +++++
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

// ----- main screen +++++
Game.text.spell = function (column, level, trueName) {
  let text = new Map()

  text.set('1,1,', '[Q] Fire Arrow\n[W] Healing Spring')
  text.set('1,2,', '[A] Flame Lance\n[S] Soothing Lotion')
  text.set('1,3,', '[1] Magma Eruption\n')

  text.set('2,1,dio', '[E] Bedtime Story\n[R] Fire Fist')
  text.set('2,1,hulk', '[E] Bedtime Story\n[R] Golem Shell')
  text.set('2,1,lasombra', '[E] Bedtime Story\n[R] Frost Touch')

  text.set('2,2,dio', '[D] Blind Death\n[F] Flame Explosion')
  text.set('2,2,hulk', '[D] Blind Death\n[F] Refresh Ointment')
  text.set('2,2,lasombra', '[D] Blind Death\n[F] Vile Tentacle')

  text.set('1,3,dio', text.get('1,3,') + '[2] The World')
  text.set('1,3,hulk', text.get('1,3,') + '[2] Invincible Armor')
  text.set('1,3,lasombra', text.get('1,3,') + '[2] Confessional')

  text.set('2,3,dio', '')
  text.set('2,3,hulk', '')
  text.set('2,3,lasombra', '')

  text.set('3,,', '[Space]')

  return text.get([column, level, trueName].join(','))
}

Game.text.modeLine = function (mode) {
  let text = new Map()

  text.set('select', 'Press a, b or c')
  text.set('space', 'Press Space to continue')
  text.set('enter', 'Press Enter to confirm')
  text.set('delete', ', Esc to delete')
  text.set('yesNoLower', 'Press y or n')

  return text.get(mode)
}

Game.text.curse = function (curse, returnMap) {
  let text = new Map()

  // level 1
  text.set('death', 'Last Words')
  text.set('hp', 'Bleeding Cuts')

  // level 2, public
  text.set('spell', 'Rigid Tongue')

  // level 2, private
  text.set('attack', 'Shaking Hands')
  text.set('resist', 'Cornered Beast')
  text.set('control', 'Confused Mind')

  // level 3
  text.set('shroud', 'Death Shroud')

  return returnMap
    ? text
    : text.get(curse)
}

Game.text.buff = function (buffID) {
  let text = new Map()

  text.set('+mov', 'Movement++')
  text.set('+acc', 'Accuracy++')
  text.set('+def', 'Defense++')
  text.set('+imm', 'Immunity')
  text.set('+cst', 'Casting++')

  return text.get(buffID)
}

Game.text.debuff = function (debuffID) {
  let text = new Map()

  text.set('-hp', 'Heal-')
  text.set('-acc', 'Accuracy-')
  text.set('-def', 'Defense-')
  text.set('-dmg', 'Damage-')
  text.set('-cst', 'Casting-')
  text.set('-poi', 'Poisoned')

  return text.get(debuffID)
}

// ----- develop +++++
Game.text.devError = function (error) {
  let text = new Map()

  text.set('mode',
    'Mode undefined!\nCurrent screen: ' + Game.screens._currentName + '.')
  text.set('seed', 'Invalid seed: ' +
    Game.entities.get('seed').Seed.getSeed() + '.')
  text.set('browser', 'Rot.js is not supported by your browser.')
  text.set('message', 'Game.screens.drawMessage() has no argument.')

  return '[Error] ' + text.get(error)
}

Game.text.devNote = function (note) {
  let text = new Map()

  text.set('rng', 'RNG start: ')

  return '[Note] ' + text.get(note)
}
