

function ProduceAswer(subtitles, wordButtons, x, y) {
  const selectedWords = wordButtons
    .filter(btn => btn.dataset.clicked === "true")
    .map(btn => btn.textContent);

  if (selectedWords.length > 0) {
    chrome.runtime.sendMessage(
      {
        action: "explainWords",
        subtitles,
        words: selectedWords.join(" "),
      },
      (response) => {
        if (response?.result) {
          showResponsePopup(response.result, x, y);
        } else {
          showResponsePopup("No response.", x, y);
        }
      }
    );
  }
}

function createTextInput(context, x, y, popup) {
  const expisodeInfo = window.episodeInfo;
  const container = document.createElement("div");
  container.style.marginTop = "10px";

  const input = document.createElement("textarea");
  input.placeholder = "Ask anything";
  Object.assign(input.style, {
    width: "100%",
    minHeight: "60px",
    padding: "8px",
    color:"black",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
    resize: "vertical",
    marginBottom: "8px"
  });
  const includeSubtitles = createButton("Include Subtitles", {
    marginLeft: "5%",
    padding: "4px 6px",
    fontSize: "14px",
    borderRadius: "4px",
    border: "none",
    background: "#444",
    color: "#fff",
    cursor: "pointer",
  });

  includeSubtitles.dataset.clicked = false;

  includeSubtitles.addEventListener("click", () => {
    const clicked = includeSubtitles.dataset.clicked === "true";
    includeSubtitles.style.background = clicked ? "#444" : "#888";
    includeSubtitles.dataset.clicked = (!clicked).toString();
  });

    const inculdeEpisodeName = createButton("Include Episode Name", {
    marginLeft: "5%",
    padding: "4px 6px",
    fontSize: "14px",
    borderRadius: "4px",
    border: "none",
    background: "#444",
    color: "#fff",
    cursor: "pointer",
  });

  inculdeEpisodeName.dataset.clicked = false;

  inculdeEpisodeName.addEventListener("click", () => {
    const clicked = inculdeEpisodeName.dataset.clicked === "true";
    inculdeEpisodeName.style.background = clicked ? "#444" : "#888";
    inculdeEpisodeName.dataset.clicked = (!clicked).toString();
  });

  const submitBtn = createButton("Submit", {
    padding: "6px 12px",
    fontSize: "14px",
    borderRadius: "4px",
    border: "none",
    background: "#28a745",
    color: "#fff",
    cursor: "pointer",
  }, () => {
    console.log(includeSubtitles.dataset.clicked ==="true" ?  window.subtitleQueue.stringify() : undefined)

    const question = input.value.trim();
    if (question.length > 0) {
      chrome.runtime.sendMessage(
        { action: "customQuestion", question: question, episodeName:inculdeEpisodeName.dataset.clicked ==="true"? expisodeInfo : undefined, subtitles:includeSubtitles.dataset.clicked ==="true" ?  window.subtitleQueue.stringify() : undefined  },
        (response) => {
          if (response?.result) {
            showResponsePopup(response.result, x, y);
          } else {
            showResponsePopup("No response.", x, y);
          }
        }
      );
      popup.remove();
    }
  });

  container.appendChild(input);
  container.appendChild(submitBtn);
  container.appendChild(includeSubtitles);
  container.appendChild(inculdeEpisodeName);

  popup.appendChild(container);
}


function createButton(label, styles, onClick) {
  const btn = document.createElement("button");
  btn.textContent = label;
  Object.assign(btn.style, styles);
  if (onClick) btn.onclick = onClick;
  return btn;
}

function createWordButton(word) {
  const btn = createButton(word, {
    margin: "2px",
    padding: "4px 6px",
    fontSize: "14px",
    borderRadius: "4px",
    border: "none",
    background: "#444",
    color: "#fff",
    cursor: "pointer",
  });

  btn.dataset.clicked = false;

  btn.addEventListener("click", () => {
    const clicked = btn.dataset.clicked === "true";
    btn.style.background = clicked ? "#444" : "#2a8";
    btn.style.fontWeight = clicked ? "normal" : "bold";
    btn.dataset.clicked = (!clicked).toString();
  });

  return btn;
}


function showSubtitlePopup(text, x, y) {
  const old = document.querySelector("#subtitle-popup");
  if (old) old.remove();

  const popup = document.createElement("div");
  popup.id = "subtitle-popup";

  const wordButtons = [];

  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.marginBottom = "8px";

  const askBtn = createButton("Ask", {
    padding: "4px 10px",
    fontSize: "14px",
    borderRadius: "4px",
    border: "none",
    background: "#0a84ff",
    color: "#fff",
    cursor: "pointer",
  }, () => {
    ProduceAswer(window.subtitleQueue.stringify(), wordButtons, x, y);
    popup.remove();
  });

  


  const closeBtn = createButton("×", {
    padding: "4px 8px",
    fontSize: "14px",
    fontWeight: "bold",
    borderRadius: "50%",
    border: "none",
    background: "red",
    color: "#fff",
    cursor: "pointer",
  }, () => popup.remove());

  const customPromptButton = createButton("custom question", {
    padding: "4px 10px",
    fontSize: "14px",
    borderRadius: "4px",
    border: "none",
    background: "#0a84ff",
    color: "#fff",
    cursor: "pointer",
  }, () => {
    popup.removeChild(wordContainer);
    header.removeChild(askBtn);
    createTextInput(window.subtitleQueue.stringify(), x, y, popup);
    header.removeChild(customPromptButton);
  });

  header.appendChild(askBtn);
  header.appendChild(customPromptButton)
  header.appendChild(closeBtn);
  popup.appendChild(header);

  const wordContainer = document.createElement("div");
  wordContainer.style.display = "flex";
  wordContainer.style.flexWrap = "wrap";
  wordContainer.style.gap = "6px";

  const words = text.trim().split(/\s+/);
  words.forEach(word => {
    const btn = createWordButton(word);
    wordButtons.push(btn);
    wordContainer.appendChild(btn);
    
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
    fontFamily: "sans-serif",
  });

  document.body.appendChild(popup);
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