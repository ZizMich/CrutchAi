import { ErrorManager } from './ErrorManager.js';
import { HistoryManager } from './HistoryManager.js';
import { SettingsManager } from './SettingsManager.js';
import { Conspect } from './Conspect.js';

export class PopupController {
    constructor() {
        this.errorManager = new ErrorManager();
        this.settingsManager = new SettingsManager();
        this.historyManager = new HistoryManager();
        this.Conspect = new Conspect();
        this.initialize();
    }

    async initialize() {
        try {
            await this.settingsManager.loadSettings();
            await this.historyManager.initializeHistory();
            await this.Conspect.initializeHistory();
        } catch (error) {
            this.errorManager.showError(error.message);
        }
    }
}