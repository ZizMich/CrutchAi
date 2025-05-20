export class SettingsManager {
    constructor() {
        this.enabledCheckbox = document.getElementById('ct-enabled');
        this.depthSelect = document.getElementById('ct-depth');
        this.targetLangSelect = document.getElementById('ct-target-lang');
        this.initializeEventListeners();
    }

    async loadSettings() {
        try {
            const data = await chrome.storage.sync.get(['enabled', 'analysisDepth', 'targetLang']);
            this.enabledCheckbox.checked = data.enabled !== false;
            this.depthSelect.value = data.analysisDepth || 'sentence';
            this.targetLangSelect.value = data.targetLang || 'ru';
        } catch (err) {
            throw new Error('Failed to load settings');
        }
    }

    async saveSettings() {
        const settings = {
            enabled: this.enabledCheckbox.checked,
            analysisDepth: this.depthSelect.value,
            targetLang: this.targetLangSelect.value
        };
        
        await chrome.storage.sync.set(settings);
        await this.notifyContentScripts(settings);
    }

    async notifyContentScripts(settings) {
        const tabs = await chrome.tabs.query({active: true, currentWindow: true});
        if (tabs[0]?.id) {
            try {
                await chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'update_settings',
                    ...settings
                });
            } catch {
                // Ignore connection errors when content script isn't loaded
            }
        }
    }

    initializeEventListeners() {
        this.enabledCheckbox.addEventListener('change', () => this.saveSettings());
        this.depthSelect.addEventListener('change', () => this.saveSettings());
        this.targetLangSelect.addEventListener('change', () => this.saveSettings());
    }
}