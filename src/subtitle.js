console.log("pivo2")
function showSubtitlePopup(text, x, y) {
  const old = document.querySelector("#subtitle-popup");
  if (old) old.remove();

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
