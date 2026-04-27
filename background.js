chrome.runtime.onMessage.addListener((message) => {
  if (message.type !== "NEW_TASK") return;

  // 1. Send Telegram Notifications
  chrome.storage.local.get(["bots"], (data) => {
    const bots = data.bots || [];
    bots
      .filter((bot) => bot.enabled)
      .forEach((bot) => {
        fetch(`https://api.telegram.org/bot${bot.botToken}/sendMessage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            chat_id: bot.chatId,
            text: `🚨 New task এসেছে!\nUn Assigned: ${message.count}`
          })
        })
          .then((res) => res.json())
          .then((data) => console.log("Telegram sent:", data))
          .catch((err) => console.error("Telegram error:", err));
      });
  });

  // 2. Show Windows Notification
  showWindowsNotification(message.count);

  // 3. Play Notification Sound
  playNotificationSound();
});

async function showWindowsNotification(count) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon128.png", // Ensure this exists or use a default
    title: "New Task Alert!",
    message: `🚨 New task এসেছে!\nUn Assigned: ${count}`,
    priority: 2
  });
}

async function playNotificationSound() {
  // Check if offscreen document exists
  const hasDocument = await chrome.offscreen.hasDocument();
  if (!hasDocument) {
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Playing notification sound for new tasks"
    });
  }

  // Send message to offscreen document to play sound
  chrome.runtime.sendMessage({
    type: "PLAY_SOUND",
    target: "offscreen",
    data: "notification.mp3"
  });
}