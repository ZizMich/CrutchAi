export class HistoryManager {
    constructor() {
        this.historyList = document.getElementById('ct-history-list');
        this.setupExportButton();
        this.loadDependencies();
    }

    loadDependencies() {
        // Load pdfmake
        const pdfScript = document.createElement('script');
        pdfScript.src = chrome.runtime.getURL('vendor/pdfmake.min.js');
        
        // Load fonts
        const fontsScript = document.createElement('script');
        fontsScript.src = chrome.runtime.getURL('vendor/vfs_fonts.js');
        
        document.head.appendChild(pdfScript);
        document.head.appendChild(fontsScript);
    }

    setupExportButton() {
        // Prevent duplicate export buttons
        if (this.historyList.parentElement.querySelector('.ct-export-btn')) return;

        const exportBtn = document.createElement('button');
        exportBtn.className = 'ct-export-btn';
        exportBtn.innerHTML = '<span>Export History</span>';
        exportBtn.onclick = () => this.handleExport();
        this.historyList.parentElement.insertBefore(exportBtn, this.historyList);
        this.exportBtn = exportBtn;
    }

    async handleExport() {
        try {
            this.exportBtn.classList.add('loading');
            const data = await chrome.storage.local.get(['ct_history']);
            const history = data.ct_history || [];
            this.downloadAsText(history);
        } catch (err) {
            console.error('Export failed:', err);
            this.errorManager?.showError('Failed to export history');
        } finally {
            this.exportBtn.classList.remove('loading');
        }
    }

    formatText(text) {
        return text
            .replace(/([^#])[#]+([^#])/g, '$1$2')
            .replace(/([^*])[*]+([^*])/g, '$1$2')
            .replace(/[#*]{3,}/g, '')
            .split('\n')
            .map(line => {
                if (line.match(/^#+\s+[A-ZА-Я]/)) {
                    return line.replace(/^#+\s+/, '• ');
                }
                if (line.match(/^\*\s+[A-ZА-Я]/)) {
                    return line.replace(/^\*\s+/, '• ');
                }
                return line.trim();
            })
            .join('\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    downloadAsText(history) {
        const content = history.map(item => `
=== ${item.word || item.text} ===
Time: ${new Date(item.ts).toLocaleString()}
Context: ${item.context}
Result: 
${this.formatText(item.result)}
----------------------------------------
`).join('\n\n');

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `translations-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    createHistoryItem(item) {
        return `
            <li class="ct-history-item">
                <div class="ct-history-header">
                    <span class="ct-history-word">${item.word || item.text}</span>
                    <span class="ct-history-time">${new Date(item.ts).toLocaleString()}</span>
                </div>
                <div class="ct-context">${item.context.slice(0, 100)}...</div>
                <div class="ct-history-expand">
                    <div class="ct-history-full-result">${this.formatText(item.result)}</div>
                </div>
            </li>
        `;
    }

    toggleHistoryItem(expandDiv) {
        const isExpanded = expandDiv.classList.contains('expanded');
        
        // Close all other expanded items
        document.querySelectorAll('.ct-history-expand.expanded').forEach(el => {
            if (el !== expandDiv) {
                el.classList.remove('expanded');
                el.style.height = '0px';
            }
        });
        
        // Toggle current item
        if (!isExpanded) {
            expandDiv.classList.add('expanded');
            expandDiv.style.height = expandDiv.scrollHeight + 'px';
        } else {
            expandDiv.classList.remove('expanded');
            expandDiv.style.height = '0px';
        }
    }

    async initializeHistory() {
        try {
            const data = await chrome.storage.local.get(['ct_history']);
            const history = data.ct_history || [];
            this.historyList.innerHTML = history.map(item => this.createHistoryItem(item)).join('');
            this.addClickHandlers();
        } catch (err) {
            throw new Error('Failed to load history');
        }
    }

    addClickHandlers() {
        this.historyList.querySelectorAll('.ct-history-item').forEach(item => {
            item.addEventListener('click', () => {
                const expandDiv = item.querySelector('.ct-history-expand');
                this.toggleHistoryItem(expandDiv);
            });
        });
    }
}