export class Conspect {
    async initializeHistory() {
        // Setup Conspect UI in popup
        const conspectSection = document.getElementById('ct-conspect');
        if (!conspectSection) return;

        // Add Generate Conspect button if not present
        let generateBtn = document.getElementById('ct-generate-conspect-btn');
        if (!generateBtn) {
            generateBtn = document.createElement('button');
            generateBtn.id = 'ct-generate-conspect-btn';
            generateBtn.className = 'ct-action-button';
            generateBtn.textContent = 'Generate Conspect for this page';
            conspectSection.insertBefore(generateBtn, conspectSection.querySelector('ul'));
        }

        // Load conspect list
        const conspectList = document.getElementById('ct-conspect-list');
        const refreshConspectList = async () => {
            const conspects = await Conspect.getConspects();
            conspectList.innerHTML = '';
            if (Object.keys(conspects).length === 0) {
                const li = document.createElement('li');
                li.textContent = 'No conspects saved yet.';
                conspectList.appendChild(li);
                return;
            }
            Object.entries(conspects).forEach(([site, data]) => {
                const li = document.createElement('li');
                li.className = 'ct-conspect-item';
                li.innerHTML = `
                    <div class="ct-conspect-header">
                        <span class="ct-conspect-url">${site}</span>
                        <button class="ct-apply-conspect-btn" title="Apply to page">Apply</button>
                        <button class="ct-view-conspect-btn" title="View">View</button>
                    </div>
                `;
                // View conspect in new window
                li.querySelector('.ct-view-conspect-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    const win = window.open('', '_blank');
                    win.document.write(`
                        <html>
                            <head>
                                <title>Conspect for ${site}</title>
                                <style>
                                    body { font-family: system-ui; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; }
                                    pre { white-space: pre-wrap; background: #f5f7ff; padding: 20px; border-radius: 8px; }
                                </style>
                            </head>
                            <body>
                                <h2>Conspect for ${site}</h2>
                                <pre>${data.content}</pre>
                            </body>
                        </html>
                    `);
                });
                // Apply conspect to current page
                li.querySelector('.ct-apply-conspect-btn').addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
                    if (!tab?.id) return;
                    await chrome.tabs.sendMessage(tab.id, {
                        type: 'APPLY_CONSPECT',
                        conspect: data.content
                    });
                });
                conspectList.appendChild(li);
            });
        };

        // Generate conspect for current page
        generateBtn.addEventListener('click', async () => {
            generateBtn.disabled = true;
            generateBtn.textContent = 'Generating...';
            try {
                const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
                if (!tab?.id) throw new Error('No active tab');
                // Ask content script to generate conspect
                const conspect = await new Promise((resolve, reject) => {
                    chrome.tabs.sendMessage(tab.id, {type: 'GENERATE_CONSPECT'}, (response) => {
                        if (chrome.runtime.lastError) {
                            reject(new Error('Content script not loaded. Refresh the page and try again.'));
                        } else {
                            resolve(response);
                        }
                    });
                });
                if (!conspect) throw new Error('Failed to generate conspect');
                await Conspect.saveConspect(tab.url, {
                    content: conspect,
                    timestamp: Date.now()
                });
                await refreshConspectList();
            } catch (e) {
                alert('Error: ' + e.message);
            }
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Conspect for this page';
        });

        // Initial load
        refreshConspectList();
    }

    static async saveConspect(url, data) {
        return new Promise(resolve => {
            chrome.storage.local.get(['conspects'], result => {
                const conspects = result.conspects || {};
                conspects[url] = data;
                chrome.storage.local.set({ conspects }, resolve);
            });
        });
    }

    static async getConspects() {
        return new Promise(resolve => {
            chrome.storage.local.get(['conspects'], result => {
                resolve(result.conspects || {});
            });
        });
    }
}
