import { PopupController } from './PopupController.js';

document.addEventListener('DOMContentLoaded', async () => {
    const popupController = new PopupController();

    // Add history display
    const historyList = document.getElementById('ct-history-list');
    const data = await chrome.storage.local.get(['ct_history']);
    const history = data.ct_history || [];

    historyList.innerHTML = history.map(item => `
        <li class="ct-history-item">
            <div class="ct-history-header">
                <span class="ct-history-word">${item.word || item.text || 'Text'}</span>
                <span class="ct-history-time">${new Date(item.ts).toLocaleString()}</span>
            </div>
            <div class="ct-history-expand">
                <div class="ct-context">${item.context || ''}</div>
                <div class="ct-history-full-result">${item.result || ''}</div>
            </div>
        </li>
    `).join('');

    // Add click handlers for history items
    historyList.querySelectorAll('.ct-history-item').forEach(item => {
        item.addEventListener('click', () => {
            const expand = item.querySelector('.ct-history-expand');
            expand.classList.toggle('expanded');
        });
    });

    // Add API key input
    const apiKeyInput = document.createElement('input');
    apiKeyInput.type = 'password';
    apiKeyInput.id = 'ct-api-key';
    apiKeyInput.placeholder = 'Enter Gemini API Key';
    
    const apiKeyLabel = document.createElement('label');
    apiKeyLabel.textContent = 'API Key: ';
    apiKeyLabel.appendChild(apiKeyInput);
    
    document.querySelector('#ct-settings').appendChild(apiKeyLabel);
    
    // Load saved API key
    const result = await chrome.storage.local.get('geminiApiKey');
    if (result.geminiApiKey) {
        apiKeyInput.value = result.geminiApiKey;
    }
    
    // Save API key when changed
    apiKeyInput.addEventListener('change', async () => {
        await chrome.storage.local.set({
            geminiApiKey: apiKeyInput.value
        });
    });
});
