const botTokenInput = document.getElementById("botToken");
const chatIdInput = document.getElementById("chatId");
const addBtn = document.getElementById("addBtn");
const botList = document.getElementById("botList");

function saveBots(bots) {
  chrome.storage.local.set({ bots }, renderBots);
}

function renderBots() {
  chrome.storage.local.get(["bots"], (data) => {
    const bots = data.bots || [];

    botList.innerHTML = "";

    if (bots.length === 0) {
      botList.innerHTML = "<p>No bot added.</p>";
      return;
    }

    bots.forEach((bot, index) => {
      const card = document.createElement("div");
      card.className = "bot-card";

      card.innerHTML = `
        <div class="row"><strong>Chat ID:</strong> ${bot.chatId}</div>
        <div class="row">
          <strong>Status:</strong>
          <span class="${bot.enabled ? "running" : "paused"}">
            ${bot.enabled ? "Running" : "Paused"}
          </span>
        </div>

        <div class="buttons">
          <button class="toggleBtn" data-index="${index}">
            ${bot.enabled ? "Pause" : "Start"}
          </button>

          <button class="removeBtn" data-index="${index}">
            Remove
          </button>
        </div>
      `;

      botList.appendChild(card);
    });

    document.querySelectorAll(".toggleBtn").forEach((btn) => {
      btn.onclick = () => {
        const index = Number(btn.dataset.index);
        bots[index].enabled = !bots[index].enabled;
        saveBots(bots);
      };
    });

    document.querySelectorAll(".removeBtn").forEach((btn) => {
      btn.onclick = () => {
        const index = Number(btn.dataset.index);
        bots.splice(index, 1);
        saveBots(bots);
      };
    });
  });
}

addBtn.onclick = () => {
  const botToken = botTokenInput.value.trim();
  const chatId = chatIdInput.value.trim();

  if (!botToken || !chatId) return;

  chrome.storage.local.get(["bots"], (data) => {
    const bots = data.bots || [];

    bots.push({
      botToken,
      chatId,
      enabled: true
    });

    chrome.storage.local.set({ bots }, () => {
      botTokenInput.value = "";
      chatIdInput.value = "";
      renderBots();
    });
  });
};

renderBots();