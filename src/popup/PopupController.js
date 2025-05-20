import { ErrorManager } from './ErrorManager.js';
import { HistoryManager } from './HistoryManager.js';
import { SettingsManager } from './SettingsManager.js';

export class PopupController {
    constructor() {
        this.errorManager = new ErrorManager();
        this.settingsManager = new SettingsManager();
        this.historyManager = new HistoryManager();
        this.initialize();
    }

    async initialize() {
        try {
            await this.settingsManager.loadSettings();
            await this.historyManager.initializeHistory();
        } catch (error) {
            this.errorManager.showError(error.message);
        }
    }
}