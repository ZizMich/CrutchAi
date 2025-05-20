class ContentController {
    constructor() {
        this.enabled = true;
        this.analysisDepth = 'sentence';
        this.targetLang = 'ru';
        this.selectionManager = new SelectionManager();
        this.uiManager = new UIManager();
        this.speechManager = new SpeechManager();

        // Disable all analyzing if in popup/settings page
        if (this.uiManager.isSettingsPage()) {
            this.enabled = false;
            return;
        }

        this.loadSettings();
        this.initializeEventListeners();
        if (!this.uiManager.isSettingsPage()) {
            this.uiManager.createFloatingIcon(this.isYouTubePage());
        }
    }

    async loadSettings() {
        const data = await chrome.storage.sync.get(['enabled', 'analysisDepth', 'targetLang']);
        this.enabled = data.enabled !== false;
        this.analysisDepth = data.analysisDepth || 'sentence';
        this.targetLang = data.targetLang || 'ru';
        this.speechManager.setTargetLanguage(this.targetLang + '-' + this.targetLang.toUpperCase());
        this.uiManager.quiz.setLanguage(this.targetLang); // Add this line
    }

    isYouTubePage() {
        return window.location.hostname === 'www.youtube.com';
    }

    async handleTextAnalysis(selection) {
        // Always analyze immediately for single words
        if (selection.text.split(/\s+/).length === 1) {
            await this.handleWordAnalysis(selection);
        } else {
            // Show action button only for multi-word selections
            this.handleSentenceAnalysis(selection);
        }
    }

    async handleWordAnalysis(selection) {
        this.uiManager.showTranslationPopup('Analyzing...', selection.rect);
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'analyze_word',
                word: selection.text,
                context: selection.context,
                targetLang: this.targetLang
            });
            if (response?.result) {
                this.uiManager.showTranslationPopup(response.result, selection.rect);
                this.selectionManager.clearSelection();
            }
        } catch (err) {
            this.uiManager.showTranslationPopup('Failed to analyze word', selection.rect);
            this.selectionManager.clearSelection();
        }
    }

    handleSentenceAnalysis(selection) {
        this.uiManager.showActionButton(selection.rect, async (currentSelection) => {
            this.uiManager.showTranslationPopup('Analyzing text...', currentSelection.rect);
            try {
                const response = await chrome.runtime.sendMessage({
                    type: 'analyze_sentence',
                    text: currentSelection.text,
                    context: currentSelection.context,
                    targetLang: this.targetLang
                });
                
                if (response?.result) {
                    this.uiManager.showTranslationPopup(response.result, currentSelection.rect);
                } else {
                    this.uiManager.showTranslationPopup(
                        response?.error || 'No analysis result received',
                        currentSelection.rect
                    );
                }
            } catch (err) {
                console.error('Analysis error:', err);
                this.uiManager.showTranslationPopup('Failed to analyze text. Please try again.', currentSelection.rect);
            }
        }, selection);
    }

    initializeEventListeners() {
        document.addEventListener('mouseup', async (e) => {
            if (!this.enabled || this.isYouTubePage() || this.uiManager.isQuizActive()) return;
            
            const selection = this.selectionManager.getSelectedTextInfo(this.analysisDepth);
            if (!selection || !selection.text.trim()) return;
            
            this.uiManager.removeExistingPopups();
            await this.handleTextAnalysis(selection);
        });

        chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
            if (msg.type === 'update_settings') {
                this.enabled = msg.enabled;
                this.analysisDepth = msg.analysisDepth;
                this.targetLang = msg.targetLang;
                this.speechManager.setTargetLanguage(msg.targetLang + '-' + msg.targetLang.toUpperCase());
                this.uiManager.quiz.setLanguage(msg.targetLang); // Add this line
            }
            if (msg.type === 'APPLY_CONSPECT') {
                try {
                    document.body.innerHTML = `<pre style="white-space:pre-wrap;font-family:inherit;padding:32px;font-size:1.1em;">${msg.conspect}</pre>`;
                    sendResponse(true);
                } catch (e) {
                    sendResponse(false);
                }
                return true;
            }
        });
    }
}