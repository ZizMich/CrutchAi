class YouTubeHelper {
    constructor() {
        // Make instance globally accessible
        window.ctYouTubeHelper = this;
        this.chatUI = null;
        this.aiService = null;
        this.asyncVoice = null;
        this.videoElement = null;
        this.transcriptManager = null;
    }

    init() {
        if (this.asyncVoice) return; // Already initialized
        
        try {
            this.asyncVoice = new AsyncVoice();
            this.aiService = new AIService();
            this.chatUI = new ChatUI();
            this.transcriptManager = new TranscriptManager();
            this.videoElement = document.querySelector('video');
            this.setupVoiceTranslation();
        } catch (error) {
            console.error('YouTubeHelper initialization failed:', error);
        }
    }

    isYouTubePage() {
        return window.location.hostname === 'www.youtube.com' && 
               window.location.pathname.includes('/watch');
    }

    setupVideoObserver() {
        const video = document.querySelector('video');
        if (!video) return;

        let lastTime = 0;
        video.addEventListener('timeupdate', () => {
            const currentTime = Math.floor(video.currentTime);
            if (currentTime !== lastTime && currentTime % 30 === 0) {
                this.suggestContext(currentTime);
            }
            lastTime = currentTime;
        });
    }

    setupVoiceTranslation() {
        if (this.videoElement) {
            this.videoElement.addEventListener('timeupdate', () => {
                if (this.asyncVoice?.isPlaying) {
                    this.asyncVoice.playAt(this.videoElement.currentTime);
                }
            });
        }
    }

    async startVoiceTranslation(targetLang) {
        if (!this.transcriptManager) {
            console.error('TranscriptManager not initialized');
            return;
        }
        
        const transcript = await this.transcriptManager.getTranscript();
        
        if (transcript) {
            this.asyncVoice.setTargetLanguage(targetLang);
            await this.asyncVoice.prepareTranslation(transcript, this.aiService);
            this.asyncVoice.start();
            if (this.videoElement) {
                this.videoElement.muted = true;
            }
        }
    }

    stopVoiceTranslation() {
        if (this.asyncVoice) {
            this.asyncVoice.stop();
        }
        if (this.videoElement) {
            this.videoElement.muted = false;
        }
    }

    async suggestContext(timestamp) {
        const transcript = await this.transcriptManager.getTranscript();
        if (!transcript) return;
        
        if (this.chatUI.chatWindow) {
            this.chatUI.suggestContext(timestamp, this.formatTime);
        }
    }

    toggleChat() {
        this.chatUI.toggleChat();
        if (this.chatUI.chatWindow) {
            this.setupChatHandlers();
        }
    }

    setupChatHandlers() {
        const input = this.chatUI.chatWindow.querySelector('input');
        const sendButton = input.nextElementSibling;
        const suggestions = this.chatUI.chatWindow.querySelectorAll('[data-action]');

        suggestions.forEach(btn => {
            btn.onclick = () => this.handleAction(btn.dataset.action);
        });

        sendButton.onclick = () => this.handleQuestion(input.value);
        input.onkeypress = (e) => {
            if (e.key === 'Enter') this.handleQuestion(input.value);
        };
    }

    async handleAction(action) {
        const transcript = await this.transcriptManager.getTranscript();
        if (!transcript) return;

        const video = document.querySelector('video');
        const currentTime = Math.floor(video.currentTime);
        
        switch(action) {
            case 'quiz':
                const quizSize = Math.floor(Math.random() * 4) + 3; // Random number between 3 and 6
                this.videoQuiz.startQuiz(transcript, currentTime, this.chatUI.chatLang, quizSize);
                return;
            case 'explain':
                const explainContext = this.transcriptManager.extractContextAroundTimestamp(transcript, currentTime);
                this.sendPromptToAI(`Explain in ${this.chatUI.chatLang} what's happening at ${this.formatTime(currentTime)} in this video. Context: ${explainContext}`);
                break;
            case 'summary':
                this.sendPromptToAI(`Provide a brief summary in ${this.chatUI.chatLang} of this video based on its transcript: ${transcript.slice(0, 1000)}...`);
                break;
            case 'context':
                const additionalContext = this.transcriptManager.extractContextAroundTimestamp(transcript, currentTime);
                this.sendPromptToAI(`Provide in ${this.chatUI.chatLang} additional context and background information for what's being discussed at ${
                    this.formatTime(currentTime)
                }. Context: ${additionalContext}`);
                break;
        }
    }

    async handleQuestion(userInput) {
        if (!userInput.trim()) return;
        
        // Clear input field immediately
        const input = this.chatUI.chatWindow.querySelector('input');
        input.value = '';

        // Add user message to chat
        this.chatUI.addMessage(userInput, 'user');

        if (this.videoQuiz.currentQuiz) {
            await this.videoQuiz.checkQuizAnswer(userInput);
            return;
        }
        
        const transcript = await this.transcriptManager.getTranscript();
        const video = document.querySelector('video');
        const currentTime = Math.floor(video.currentTime);
        
        const context = this.transcriptManager.extractContextAroundTimestamp(transcript, currentTime);
        const prompt = `Answer in ${this.chatUI.chatLang} this question about the video: "${userInput}" 
            Current timestamp: ${this.formatTime(currentTime)}
            Context from transcript: ${context}`;
        
        this.sendPromptToAI(prompt);
    }

    async sendPromptToAI(prompt) {
        const loadingIndicator = this.chatUI.showTypingIndicator();
        
        try {
            const response = await this.aiService.sendPrompt(prompt);

            if (response && response.result) {
                this.chatUI.removeTypingIndicator(loadingIndicator);
                const formattedText = this.aiService.formatResponse(response.result);
                
                if (loadingIndicator) {
                    loadingIndicator.innerHTML = `
                        <div class="yt-assist-timestamp">${this.formatTime(document.querySelector('video').currentTime)}</div>
                        <div class="yt-assist-text">${formattedText}</div>
                    `;
                }
            } else if (response.error) {
                throw new Error(response.error);
            } else {
                throw new Error('Invalid response from AI');
            }
        } catch (error) {
            console.error('AI analysis failed:', error);
            
            if (loadingIndicator) {
                this.chatUI.removeTypingIndicator(loadingIndicator);
                loadingIndicator.innerHTML = `
                    <div class="yt-assist-timestamp">Error</div>
                    <div class="yt-assist-text">Failed to analyze video content. Please try again.</div>
                `;
            }
        }
    }

    formatTime(seconds) {
        return new Date(seconds * 1000).toISOString().substr(11, 8);
    }
}

// Ensure global access
window.YouTubeHelper = YouTubeHelper;