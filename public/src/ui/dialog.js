let levelDialog, levelDialogTxt, levelDialogBtn;
let _onClose = null;

export function initDialog() {
  levelDialog = document.getElementById('level-dialog');
  levelDialogTxt = document.getElementById('level-dialog-text');
  levelDialogBtn = document.getElementById('level-dialog-btn');

  levelDialogBtn.addEventListener('click', () => { window.__playUiSfx?.(); closeDialog(); });
  levelDialog.addEventListener('click', e => { if (e.target === levelDialog) { window.__playUiSfx?.(); closeDialog(); } });

  window.__showDialog = ({ message, onClose }) => {
    levelDialogTxt.textContent = message;
    levelDialog.classList.add('visible');
    _onClose = onClose || null;
  };


}

function closeDialog() {
  levelDialog.classList.remove('visible');
  if (_onClose) { const cb = _onClose; _onClose = null; cb(); }
}