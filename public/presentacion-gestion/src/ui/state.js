export const MAX = 5;
export const ARROW = {
  up: '▲', down: '▼', left: '◀', right: '▶',
  func1: 'ƒ',
  jump: '⏺',
  jump_up: '▲', jump_down: '▼', jump_left: '◀', jump_right: '▶',
};
export const LABEL = {
  up: 'move up', down: 'move down', left: 'move left', right: 'move right',
  func1: 'funcion 1',
  jump: 'jump',
  jump_up: 'jump up', jump_down: 'jump down', jump_left: 'jump left', jump_right: 'jump right',
};
export const GYM = window.__GYM = { queue: [], queueFunc1: [], running: false, onRun: null, onRestart: null };