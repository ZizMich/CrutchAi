function ProduceAswer(context, wordButtons, x,y ){
    const selectedWords = wordButtons
    .filter(btn => btn.dataset.clicked === "true")
    .map(btn => btn.textContent);
  
  chrome.runtime.sendMessage(
    { action: "ask", words: selectedWords.join(" "), context:context },
    (response) => {
      if (response?.result) {
        showResponsePopup(response.result,x,y);
      } else {
        showResponsePopup("Keine Antwort erhalten.",x,y);
        
      }
    }
  );
}
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
    ProduceAswer(window.subtitleQueue.stringify(), wordButtons ,x ,y)
    popup.remove();
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

class SubtitleQueue {
  constructor(maxLength) {
    this.maxLength = maxLength;
    this.items = [];
  }

  // Methode zum Hinzufügen von Titeln zur Warteschlange
  add(subtitle) {
    if(subtitle.length>2){

    // Bereinigung von 'subtitle' (whitespace entfernen, normalisieren)
    const cleanSubtitle = this.cleanString(subtitle);

    // Überprüfe, ob der bereinigte Titel bereits in der Warteschlange ist
    if (!this.items.some(item => this.cleanString(item) === cleanSubtitle)) {
      this.items.push(subtitle);
      // Wenn die Warteschlange zu lang wird, entferne das älteste Element
      if (this.items.length > this.maxLength) {
        this.items.shift();
      }
    }
  }
}

  // Bereinigung der Zeichenkette (entferne führende/abschließende Leerzeichen und doppelte Leerzeichen)
  cleanString(str) {
    return str.trim().replace(/\s+/g, ' ');
  }

  // Methode zum Abrufen aller Elemente als Kopie (um Seiteneffekte zu vermeiden)
  getAll() {
    return [...this.items];
  }

  // Methode, um den ersten (ältesten) Titel in der Warteschlange zu überprüfen
  peek() {
    return this.items.length > 0 ? this.items[0] : undefined;
  }

  // Hilfsmethode zum Stringifizieren der Warteschlange
  stringify() {
    return this.items.join("\n");
  }
}


window.subtitleQueue = new SubtitleQueue(10);