class ChatUI {
    constructor() {
        this.chatWindow = null;
        this.chatLang = 'en'; // Default language
        this.voiceTranslationActive = false;
    }

    createChatWindow() {
        const chat = document.createElement('div');
        chat.className = 'yt-assist-chat';
        chat.innerHTML = `
            <div class="yt-assist-header">
                <div class="yt-assist-header-left">
                    <span>Video Assistant</span>
                    <select class="yt-assist-lang">
                        <option value="en">English</option>
                        <option value="ru">Russian</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="zh">Chinese</option>
                        <option value="ja">Japanese</option>
                    </select>
                </div>
                <button class="yt-assist-close" type="button" aria-label="Close">×</button>
            </div>
            <div class="yt-assist-content">
                <div class="yt-assist-suggestions">
                    <button data-action="explain">Explain Current Moment</button>
                    <button data-action="summary">Video Summary</button>
                    <button data-action="context">Provide Context</button>
                    <button data-action="quiz">Take Quiz</button>
                </div>
                <div class="yt-assist-messages"></div>
            </div>
            <div class="yt-assist-input">
                <input type="text" placeholder="Ask about the video...">
                <button>Send</button>
            </div>
        `;
        document.body.appendChild(chat);
        this.chatWindow = chat;

        // Close button handler
        const closeBtn = chat.querySelector('.yt-assist-close');
        closeBtn.addEventListener('click', () => {
            chat.remove();
            this.chatWindow = null;
        });

        // Add language change handler
        const langSelect = chat.querySelector('.yt-assist-lang');
        langSelect.value = this.chatLang;
        langSelect.addEventListener('change', (e) => {
            this.chatLang = e.target.value;
        });

        this.addVoiceTranslationButton();
    }

    toggleChat() {
        if (this.chatWindow) {
            this.chatWindow.remove();
            this.chatWindow = null;
        } else {
            this.createChatWindow();
        }
    }

    addMessage(text, type = 'ai') {
        if (!this.chatWindow) return;
        
        const messages = this.chatWindow.querySelector('.yt-assist-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `yt-assist-message ${type}-message`;
        messageDiv.innerHTML = `
            <div class="yt-assist-text">${text}</div>
        `;
        messages.appendChild(messageDiv);
        messages.scrollTop = messages.scrollHeight;
    }

    showTypingIndicator() {
        if (!this.chatWindow) return;
        
        const messages = this.chatWindow.querySelector('.yt-assist-messages');
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'yt-assist-message ai-message loading';
        loadingMessage.textContent = 'Analyzing video content...';
        messages.appendChild(loadingMessage);
        messages.scrollTop = messages.scrollHeight;
        
        return loadingMessage;
    }

    removeTypingIndicator(indicator) {
        if (indicator) {
            indicator.classList.remove('loading');
        }
    }

    suggestContext(timestamp, formatTime) {
        if (!this.chatWindow) return;
        
        const messages = this.chatWindow.querySelector('.yt-assist-messages');
        messages.innerHTML += `
            <div class="yt-assist-message">
                <div class="yt-assist-timestamp">${formatTime(timestamp)}</div>
                <div class="yt-assist-text">Need help understanding this part?</div>
            </div>
        `;
    }

    addVoiceTranslationButton() {
        // Inject asyncVoice.css if not present
        if (!document.getElementById('ct-async-voice-style')) {
            const style = document.createElement('link');
            style.rel = 'stylesheet';
            style.href = chrome.runtime.getURL('src/styles/asyncVoice.css');
            style.id = 'ct-async-voice-style';
            document.head.appendChild(style);
        }

        if (!this.chatWindow) return;

        const button = document.createElement('button');
        button.className = 'ct-voice-translate-btn';
        button.innerHTML = `<span class="ct-voice-icon"></span>Voice`;
        button.onclick = () => this.toggleVoiceTranslation();
        
        const headerLeft = this.chatWindow.querySelector('.yt-assist-header-left');
        headerLeft.appendChild(button);
    }

    async toggleVoiceTranslation() {
        const youtubeHelper = window.ctYouTubeHelper;
        
        if (!youtubeHelper) {
            console.error('YouTube Helper not initialized');
            return;
        }

        if (!this.voiceTranslationActive) {
            const targetLang = document.querySelector('#ct-target-lang')?.value || 'en';
            await youtubeHelper.startVoiceTranslation(targetLang);
            this.voiceTranslationActive = true;
        } else {
            youtubeHelper.stopVoiceTranslation();
            this.voiceTranslationActive = false;
        }
    }
}

window.ChatUI = ChatUI;