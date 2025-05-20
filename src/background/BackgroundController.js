import { GeminiService } from './GeminiService.js';
import { CacheManager } from './CacheManager.js';

export class BackgroundController {
    constructor() {
        this.geminiService = new GeminiService("AIzaSyDcaqMrEyl9_jv1umfTe4cJE4yZZ2BmBoE");
        this.cacheManager = new CacheManager();
        this.initializeMessageHandlers();
        this.initializeExtension();
    }

    initializeMessageHandlers() {
        chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
            switch (msg.type) {
                case 'analyze_word':
                    this.handleWordAnalysis(msg, sendResponse);
                    break;
                case 'analyze_sentence':
                    this.handleSentenceAnalysis(msg, sendResponse);
                    break;
                case 'analyze_video':
                    this.handleVideoAnalysis(msg, sendResponse);
                    break;
                case 'generate_quiz':
                    this.handleQuizGeneration(msg, sendResponse);
                    break;
                case 'open_popup':
                    chrome.action.openPopup();
                    break;
            }
            return true; // Keep channel open for async response
        });
    }

    async handleWordAnalysis(msg, sendResponse) {
        const cacheKey = `${msg.word}::${msg.context}::${msg.targetLang || 'ru'}`;
        try {
            const cached = await this.cacheManager.getCached(cacheKey);
            if (cached) {
                sendResponse({ result: cached });
                return;
            }

            const result = await this.geminiService.fetchAnalysis(
                msg.word, msg.context, msg.targetLang
            );

            await this.cacheManager.setCached(cacheKey, result);
            await this.cacheManager.addToHistory({
                word: msg.word,
                context: msg.context,
                targetLang: msg.targetLang || 'ru',
                result
            });

            sendResponse({ result });
        } catch (error) {
            sendResponse({ error: error.message });
        }
    }

    async handleSentenceAnalysis(msg, sendResponse) {
        const cacheKey = `sentence::${msg.text}::${msg.targetLang || 'ru'}`;
        try {
            const cached = await this.cacheManager.getCached(cacheKey);
            if (cached) {
                sendResponse({ result: cached });
                return;
            }

            const result = await this.geminiService.fetchAnalysis(
                msg.text, msg.context, msg.targetLang, 'sentence'
            );

            await this.cacheManager.setCached(cacheKey, result);
            await this.cacheManager.addToHistory({
                type: 'sentence',
                text: msg.text,
                context: msg.context,
                targetLang: msg.targetLang || 'ru',
                result
            });

            sendResponse({ result });
        } catch (error) {
            sendResponse({ error: 'Failed to analyze sentence' });
        }
    }

    async handleVideoAnalysis(msg, sendResponse) {
        try {
            const result = await this.geminiService.fetchAnalysis(
                msg.prompt, '', '', 'video'
            );
            sendResponse({ result });
        } catch (error) {
            sendResponse({ result: 'Failed to analyze video content.' });
        }
    }

    async handleQuizGeneration(msg, sendResponse) {
        const cacheKey = `quiz::${msg.content}::${msg.targetLang || 'ru'}`;
        try {
            const cached = await this.cacheManager.getCached(cacheKey);
            if (cached) {
                sendResponse({ result: cached });
                return;
            }
            const result = await this.geminiService.fetchAnalysis(
                this.geminiService._buildQuizPrompt(msg.content, msg.targetLang),
                '', msg.targetLang, 'quiz'
            );
            await this.cacheManager.setCached(cacheKey, result);
            await this.cacheManager.addToHistory({
                type: 'quiz',
                content: msg.content,
                targetLang: msg.targetLang || 'ru',
                result
            });
            sendResponse({ result });
        } catch (error) {
            sendResponse({ error: 'Failed to generate quiz' });
        }
    }

    initializeExtension() {
        chrome.runtime.onInstalled.addListener(() => {
            chrome.storage.sync.set({
                enabled: true,
                analysisDepth: 'sentence',
                targetLang: 'ru'
            });
        });
    }
}