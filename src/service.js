import { AskHelper } from "./aiservice.js";
import standartPrompts from "./prompts.js";

// Nachrichten-Listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Empfangene Nachricht:", message);

  handleMessage(message)
    .then(async result => {
      const translateTo = await getFromStorage("translate_to") || "German";
      return AskHelper(result, translateTo);
    })
    .then(result => {
      sendResponse({ result });
    })
    .catch(error => {
      console.error("Fehler beim Verarbeiten:", error);
      sendResponse({ error: error.message });
    });

  return true; // wichtig für async sendResponse
});

async function handleMessage(message) {
  if (message.action === "explainWords") {
    return await buildExplainWordsPrompt(message);
  } else if (message.action === "customQuestion") {
    return buildCustomQuestionPrompt(message);
  } else {
    throw new Error("Unbekannte Aktion: " + message.action);
  }
}

// Prompt-Erstellung für Worterklärung
async function buildExplainWordsPrompt({ subtitles, words }) {
  const useCustomPrompt = await getFromStorage("useCustomPrompt");
  let prompt = "";

  if (useCustomPrompt) {
    prompt = await getFromStorage("customPrompt");
  } else {
    const translateTo = await getFromStorage("translate_to") || "German";
    prompt = standartPrompts[translateTo] || standartPrompts["German"];
  }

  const promptText = `Subtitles: ${subtitles}\n${prompt}\n${words}`;
  console.log("Generierter Prompt:", promptText);
  return promptText;
}

// Prompt-Erstellung für benutzerdefinierte Fragen
function buildCustomQuestionPrompt({ subtitles = [], episodeName = "", question }) {
  const subs = subtitles.length > 0 ? `Subtitles: ${subtitles}\n` : "";
  const info = episodeName ? `Episode name: ${episodeName}\n` : "";
  const prompt = `${subs}${info}${question}`;
  console.log("Benutzerdefinierter Prompt:", prompt);
  return prompt;
}

// Hilfsfunktion zum Abrufen aus Storage
function getFromStorage(key) {
  return new Promise(resolve => {
    chrome.storage.local.get(key, result => resolve(result[key]));
  });
}
