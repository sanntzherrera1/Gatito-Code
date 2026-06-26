import { initQueue } from './queue.js';
import { initDialog } from './dialog.js';
import { initEditor } from './editor-ui.js';
import { initNameDialog } from './name-dialog.js';
import { initMission } from './mission.js';
import { initResult } from './result.js';
import { initBackGesture } from './back-gesture.js';

initQueue();
initDialog();
initEditor();
initNameDialog();
initMission();
initResult();
initBackGesture();

// Cursor "holding": mientras se mantiene presionado el mouse, body.mouse-held
// cambia la patita por la variante que sostiene (ver css/base.css).
const setMouseHeld = (on) => document.body.classList.toggle('mouse-held', on);
document.addEventListener('mousedown', () => setMouseHeld(true));
document.addEventListener('mouseup', () => setMouseHeld(false));
// En drag-and-drop el mouseup no dispara confiable: soltar/terminar el arrastre
// debe volver la patita a normal igual.
document.addEventListener('dragend', () => setMouseHeld(false));
document.addEventListener('drop', () => setMouseHeld(false));
document.addEventListener('pointerup', () => setMouseHeld(false));
document.addEventListener('pointercancel', () => setMouseHeld(false));
// Si se suelta fuera de la ventana o se pierde el foco, no dejar la patita "pegada".
document.addEventListener('mouseleave', () => setMouseHeld(false));
window.addEventListener('blur', () => setMouseHeld(false));