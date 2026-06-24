export const MAX = 5;
export const ARROW = {
  up: '\u25b2', down: '\u25bc', left: '\u25c0', right: '\u25b6',
  func1: 'f',
  for: 'FOR',
  jump: '\u23fa',
  jump_up: '\u25b2', jump_down: '\u25bc', jump_left: '\u25c0', jump_right: '\u25b6',
};
export const LABEL = {
  up: 'move up', down: 'move down', left: 'move left', right: 'move right',
  func1: 'funcion 1',
  for: 'repetir',
  jump: 'jump',
  jump_up: 'jump up', jump_down: 'jump down', jump_left: 'jump left', jump_right: 'jump right',
};
export const GYM = window.__GYM = {
  queue: [],
  queueFunc1: [],
  queueFor: [],
  forCount: 2,
  ifCondition: '',
  ifAction: '',
  ifCondition2: '',
  ifAction2: '',
  running: false,
  locked: false,   // tras ganar/perder: bloquea agregar movimientos y ejecutar hasta reintentar
  onRun: null,
  onRestart: null,
};
