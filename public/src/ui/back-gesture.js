// Intercepta el gesto de "volver atras" del navegador (boton back en desktop,
// swipe desde el borde izquierdo en mobile, etc.) y lo redirige a la accion
// in-game equivalente a ESC. Asi no se sale de la pagina en mobile.
//
// Estrategia: al cargar empujamos un estado de history para que el primer
// back dispare `popstate`. Ahi ejecutamos el handler de la escena activa
// (si hay) y re-empujamos el estado para que el siguiente gesto tambien
// quede interceptado. El usuario nunca sale de la app via back-gesture.

const handlers = new WeakMap();
let pushed = false;

export function initBackGesture() {
  if (pushed) return;
  pushed = true;

  history.pushState({ __appBack: true }, '');

  window.addEventListener('popstate', () => {
    const game = window.__game;
    if (game) {
      const activeScenes = game.scene.getScenes();
      for (const scene of activeScenes) {
        const fn = handlers.get(scene);
        if (fn) { fn(); break; }
      }
    }
    // Re-empujamos para que el siguiente gesto tambien sea interceptado.
    history.pushState({ __appBack: true }, '');
  });
}

export function setBackHandler(scene, fn) {
  if (fn) handlers.set(scene, fn);
  else handlers.delete(scene);
}
