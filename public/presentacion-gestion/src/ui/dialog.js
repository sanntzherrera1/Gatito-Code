let levelDialog, levelDialogTxt, levelDialogBtn;

export function initDialog() {
  levelDialog = document.getElementById('level-dialog');
  levelDialogTxt = document.getElementById('level-dialog-text');
  levelDialogBtn = document.getElementById('level-dialog-btn');

  levelDialogBtn.addEventListener('click', closeDialog);
  levelDialog.addEventListener('click', e => { if (e.target === levelDialog) closeDialog(); });

  window.__showDialog = ({ message }) => {
    levelDialogTxt.textContent = message;
    levelDialog.classList.add('visible');
  };
}

function closeDialog() {
  levelDialog.classList.remove('visible');
}