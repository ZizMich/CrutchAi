import { BackgroundController } from './BackgroundController.js';

// Initialize the background controller
const backgroundController = new BackgroundController();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GENERATE_CONSPECT') {
        (async () => {
            try {
                // Get page content from content script
                const content = await chrome.tabs.sendMessage(sender.tab.id, { type: 'GET_PAGE_TEXT' });
                
                // Use Gemini to generate conspect
                const prompt = `Create a study conspect from this text. For each important concept or sentence, add explanations in parentheses. Focus on definitions, key terms, and relationships between concepts. Make it detailed and educational. Text: ${content}`;
                
                const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateText', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${YOUR_GEMINI_API_KEY}`
                    },
                    body: JSON.stringify({
                        prompt: { text: prompt },
                        temperature: 0.3,
                        maxTokens: 1024
                    })
                });

                const data = await response.json();
                sendResponse({ conspect: data.candidates[0].text });
            } catch (error) {
                console.error('Conspect generation error:', error);
                sendResponse({ error: 'Failed to generate conspect' });
            }
        })();
        return true;
    }
});