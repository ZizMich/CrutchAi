export class CacheManager {
    constructor() {
        this.HISTORY_KEY = 'ct_history';
        this.HISTORY_LIMIT = 100;
    }

    async getCached(key) {
        const data = await chrome.storage.local.get([key]);
        return data[key];
    }

    async setCached(key, value) {
        await chrome.storage.local.set({ [key]: value });
    }

    async addToHistory(item) {
        const data = await chrome.storage.local.get([this.HISTORY_KEY]);
        let history = data[this.HISTORY_KEY] || [];
        history.unshift({ ...item, ts: Date.now() });
        if (history.length > this.HISTORY_LIMIT) {
            history = history.slice(0, this.HISTORY_LIMIT);
        }
        await chrome.storage.local.set({ [this.HISTORY_KEY]: history });
    }
}