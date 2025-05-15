// Event Listener für Kontextmenü
const subtitleQueue = window.subtitleQueue;
document.addEventListener("contextmenu", (e) => {
  const els = document.querySelectorAll(".player-timedtext");
  
  e.preventDefault();
  let titles = "";
  els.forEach(el => {
    titles += el.textContent + "\n";
  });

  // Entferne unerwünschte Zeichen
  titles = titles.replace(/[.,!?;:"()\[\]{}\-]/g, " ");
  e.stopImmediatePropagation();
  
  // Popup mit Untertiteln anzeigen
  window.showSubtitlePopup(titles, e.clientX, e.clientY);
}, true);

// Ziel-Element für die MutationObserver-Beobachtung
const config = { childList: true, subtree: true, characterData: true };

// Callback-Funktion, wenn eine Mutation auftritt// Callback-Funktion, wenn eine Mutation auftritt
const callback = (mutationsList, observer) => {
  const els = document.querySelectorAll(".player-timedtext");
  let titles = "";
  els.forEach(el => {
    titles += el.textContent + " ";
  });

  // Bereinige den Titel, um duplikate aufgrund von unsichtbaren Zeichen zu vermeiden
  
  subtitleQueue.add(titles);


  console.log(subtitleQueue.stringify());
};


// Funktion, um den Observer zu starten, wenn das Ziel-Element vorhanden ist
function startObserverIfElementExists() {
  const targetNode = document.querySelector(".player-timedtext");

  // Wenn das Ziel-Element gefunden wird, starte den Observer und stoppe das Intervall
  if (targetNode) {
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
    
    // Intervall stoppen, da das Element jetzt beobachtet wird
    clearInterval(observerInterval);
  }
}

// Setze ein Intervall, um regelmäßig nach dem Element zu suchen
const observerInterval = setInterval(startObserverIfElementExists, 300);
