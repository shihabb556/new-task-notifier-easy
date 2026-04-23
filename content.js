(() => {
  function getUnassignedCount() {
    const text = document.body.innerText;
    const match = text.match(/Un Assigned\s*:\s*(\d+)/i);

    return match ? parseInt(match[1], 10) : 0;
  }

  const count = getUnassignedCount();

  chrome.storage.local.get(
    ["alreadyNotified", "lastCount"],
    (data) => {
      const alreadyNotified = data.alreadyNotified ?? false;
      const lastCount = data.lastCount ?? 0;

      // 0 -> non-zero হলে একবার notify
      if (count > 0 && !alreadyNotified) {
        chrome.runtime.sendMessage({
          type: "NEW_TASK",
          count
        });

        chrome.storage.local.set({
          alreadyNotified: true,
          lastCount: count
        });

        return;
      }

      // যদি page refresh হওয়ার পর count আবার 0 হয়, reset
      if (count === 0) {
        chrome.storage.local.set({
          alreadyNotified: false,
          lastCount: 0
        });
      }

      // count change হলেও শুধু latest count store
      if (count > 0 && alreadyNotified && count !== lastCount) {
        chrome.storage.local.set({
          lastCount: count
        });
      }
    }
  );
})();