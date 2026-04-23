chrome.runtime.onMessage.addListener((message) => {
  if (message.type !== "NEW_TASK") return;

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
});