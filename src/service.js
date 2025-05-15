import { AskHelper } from "./aiservice.js";
import standartPrompts from "./prompts.js";
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "ask") {
    const prompt = processRequest(message.context, message.words);
    prompt.then((result) => {
      AskHelper(result)
        .then((result) => {
          sendResponse({ result });
        })
        .catch((error) => {
          sendResponse({ error: error.message });
        });
    });

    return true; // wichtig, damit sendResponse async funktioniert
  }
});
function getFromStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => {
      resolve(result[key]);
    });
  });
}

export async function processRequest(context, words) {
        

  let prompt = "";
  const useCustomPrompt = await getFromStorage("useCustomPrompt");

  if (!useCustomPrompt) {
    const translateTo = await getFromStorage("translate_to");
    prompt = standartPrompts[translateTo];
  } else {
    prompt = await getFromStorage("customPrompt");
  }

  const promptText = "Context: " + context + prompt + "\n " + words;
  console.log("got request, prompt is:" + promptText )
  return promptText;
}
