(() => {
  let lastProcessedCount = -1;

  function getUnassignedCount() {
    const text = document.body.innerText;
    // Match "Un Assigned : {digits}" or "Un Assigned: {digits}"
    const match = text.match(/Un Assigned\s*:\s*(\d+)/i);
    return match ? parseInt(match[1], 10) : 0;
  }

  function checkAndNotify() {
    const count = getUnassignedCount();

    // Avoid redundant processing if count hasn't changed
    if (count === lastProcessedCount) return;
    lastProcessedCount = count;

    chrome.storage.local.get(["alreadyNotified", "lastCount"], (data) => {
      const lastCount = data.lastCount ?? 0;

      // Notify if count has INCREASED
      if (count > lastCount) {
        chrome.runtime.sendMessage({
          type: "NEW_TASK",
          count: count
        });

        chrome.storage.local.set({
          lastCount: count,
          alreadyNotified: true
        });
      } else if (count === 0) {
        // Reset if count goes back to 0
        chrome.storage.local.set({
          lastCount: 0,
          alreadyNotified: false
        });
      } else {
        // Just update the count if it decreased but still > 0
        chrome.storage.local.set({
          lastCount: count
        });
      }
    });
  }

  // Initial check
  checkAndNotify();

  // Watch for changes in the DOM
  const observer = new MutationObserver(() => {
    // Debounce slightly to avoid rapid firing
    clearTimeout(window._notifierTimeout);
    window._notifierTimeout = setTimeout(checkAndNotify, 1000);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  console.log("Telegram Task Notifier: Observer started.");
})();