let timerIds = [];
let activeSessionId = null;

export function setSessionId(sessionId) {
  activeSessionId = sessionId;
}

export function schedule(callback, delay) {
  const id = setTimeout(() => {
    // Clean ourselves up before running the callback
    const idx = timerIds.indexOf(id);
    if (idx !== -1) timerIds.splice(idx, 1);
    
    // Only execute if the session is still active
    callback();
  }, delay);
  timerIds.push(id);
  return id;
}

export function scheduleSession(callback, delay, sessionId) {
  const id = setTimeout(() => {
    const idx = timerIds.indexOf(id);
    if (idx !== -1) timerIds.splice(idx, 1);
    
    // Only execute if the session is still active
    if (sessionId === activeSessionId) {
      callback();
    }
  }, delay);
  timerIds.push(id);
  return id;
}

export function clearAllTimers() {
  for (const id of timerIds) {
    clearTimeout(id);
  }
  timerIds.length = 0;
}
