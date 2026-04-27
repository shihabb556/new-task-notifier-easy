chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "PLAY_SOUND" && message.target === "offscreen") {
    playAudio(message.data);
  }
});

function playAudio(source) {
  const audio = new Audio(source || "notification.mp3");
  audio.play().catch((error) => console.error("Error playing audio:", error));
}
