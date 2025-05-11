console.log("pivo");

document.addEventListener("contextmenu", (e) => {
  const els = document.querySelectorAll(".player-timedtext")
  e.preventDefault()
  var titles = ""
  els.forEach(el=>{
    titles+=el.textContent
    titles+=" "
  })
  e.stopImmediatePropagation();
  
  window.showSubtitlePopup(titles, e.clientX, e.clientY);
}, true);

// Der Rest deines Netflix-Player-Codes...
