import { AskHelper } from "./aiservice.js";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message);

  if (message.action === "ask") {
    console.log("Nachricht vom Content-Skript:", message.prompt);

    AskHelper(message.prompt).then(result => {
      sendResponse({ result });
    }).catch(error => {
      sendResponse({ error: error.message });
    });

    return true;
  }
});