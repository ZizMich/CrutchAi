console.log("pivo2")
function showSubtitlePopup(text, x, y) {
  const old = document.querySelector("#subtitle-popup");
  if (old) old.remove();
  wordButtons = []
  const popup = document.createElement("div");
  popup.id = "subtitle-popup";

  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";
  header.style.marginBottom = "8px";

  const askButton = document.createElement("button");
  askButton.textContent = "Ask";
  Object.assign(askButton.style, {
    padding: "4px 10px",
    fontSize: "14px",
    borderRadius: "4px",
    border: "none",
    background: "#0a84ff",
    color: "#fff",
    cursor: "pointer"
  });
askButton.onclick = () => {
  const selectedWords = wordButtons
    .filter(btn => btn.dataset.clicked === "true")
    .map(btn => btn.textContent);

  const promptText = "Kontext:" + text + " \n Was bedeuten diese Wörter in diesem Kontext?:" + selectedWords.join(" ");
  console.log(promptText)
  
  chrome.runtime.sendMessage(
    { action: "ask", prompt: promptText },
    (response) => {
      if (response?.result) {
        showResponsePopup(response.result,x,y);
        popup.remove();
      } else {
        showResponsePopup("Keine Antwort erhalten.",x,y);
        popup.remove();
      }
    }
  );
};
  const closeButton = document.createElement("button");
  closeButton.textContent = "×";
  Object.assign(closeButton.style, {
    padding: "4px 8px",
    fontSize: "14px",
    fontWeight: "bold",
    borderRadius: "50%",
    border: "none",
    background: "red",
    color: "#fff",
    cursor: "pointer"
  });

  closeButton.onclick = () => popup.remove();

  header.appendChild(askButton);
  header.appendChild(closeButton);
  popup.appendChild(header);

  const wordContainer = document.createElement("div");
  wordContainer.style.display = "flex";
  wordContainer.style.flexWrap = "wrap";
  wordContainer.style.gap = "6px";

  const words = text.trim().split(/\s+/);
  words.forEach(word => {
    const button = document.createElement("button");
    button.textContent = word;

    Object.assign(button.style, {
      margin: "2px",
      padding: "4px 6px",
      fontSize: "14px",
      borderRadius: "4px",
      border: "none",
      background: "#444",
      color: "#fff",
      cursor: "pointer"
    });

    button.addEventListener("click", () => {
      const clicked = button.dataset.clicked === "true";
      button.style.background = clicked ? "#444" : "#2a8";
      button.style.color = "#fff";
      button.style.fontWeight = clicked ? "normal" : "bold";
      button.dataset.clicked = !clicked;
    });

    wordContainer.appendChild(button);
    wordButtons.push(button)
  });

  popup.appendChild(wordContainer);

  Object.assign(popup.style, {
    position: "fixed",
    top: `${y}px`,
    left: `${x}px`,
    padding: "12px",
    background: "#222",
    borderRadius: "10px",
    zIndex: "999999",
    boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
    maxWidth: "600px",
    color: "#fff",
    fontFamily: "sans-serif"
  });

  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 10000);
}

// Globale Funktion verfügbar machen
window.showSubtitlePopup = showSubtitlePopup;

function showResponsePopup(responseText, x, y) {
  const existing = document.querySelector("#response-popup");
  if (existing) existing.remove();

  const popup = document.createElement("div");
  popup.id = "response-popup";

  Object.assign(popup.style, {
    position: "fixed",
    top: `${y}px`,
    left: `${x}px`,
    maxWidth: "800px",
    maxWidth: "500px",
    padding: "16px",
    background: "#111",
    color: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.5)",
    zIndex: "999999",
    fontFamily: "sans-serif",
    whiteSpace: "pre-wrap",
    fontSize:"20px"
  });

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
  Object.assign(closeBtn.style, {
    position: "absolute",
    top: "4px",
    right: "8px",
    background: "transparent",
    color: "#fff",
    border: "none",
    fontSize: "22px",
    cursor: "pointer"
  });
  closeBtn.onclick = () => popup.remove();

  const content = document.createElement("div");
  content.textContent = responseText;

  popup.appendChild(closeBtn);
  popup.appendChild(content);
  document.body.appendChild(popup);
}
