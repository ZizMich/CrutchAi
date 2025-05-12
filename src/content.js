console.log("pivo");

document.addEventListener("contextmenu", (e) => {
  const els = document.querySelectorAll(".player-timedtext");

  e.preventDefault();
  let titles = "";
  els.forEach(el => {
    titles += el.textContent + " ";
  });

titles = titles.replace(/[.,!?;:"()\[\]{}\-]/g, " ");
  e.stopImmediatePropagation();
  window.showSubtitlePopup(titles, e.clientX, e.clientY);
}, true);