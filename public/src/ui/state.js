export const MAX = 5;
export const ARROW = {
  up: '▲', down: '▼', left: '◀', right: '▶',
  func1: 'ƒ',
  jump: '⏺',
  jump_up: '▲', jump_down: '▼', jump_left: '◀', jump_right: '▶',
  'if-rock-jump': '?',
};
export const LABEL = {
  up: 'move up', down: 'move down', left: 'move left', right: 'move right',
  func1: 'funcion 1',
  jump: 'jump',
  jump_up: 'jump up', jump_down: 'jump down', jump_left: 'jump left', jump_right: 'jump right',
  'if-rock-jump': 'si roca salta',
};
export const GYM = window.__GYM = {
  queue: [],
  queueFunc1: [],
  queueIfRock: [],
  running: false,
  onRun: null,
  onRestart: null,
};
