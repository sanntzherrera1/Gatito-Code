export function initMission() {
  window.__setMission = (text) => {
    const box = document.getElementById('mission');
    const txt = document.getElementById('mission-text');
    if (!box || !txt) return;
    if (text) {
      txt.textContent = text;
      box.style.display = 'flex';
    } else {
      box.style.display = 'none';
    }
  };
}
