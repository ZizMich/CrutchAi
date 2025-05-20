class SelectionManager {
    constructor() {
        this.lastSelection = null;
    }

    clearSelection() {
        window.getSelection().removeAllRanges();
    }

    getSelectedTextInfo(analysisDepth) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return null;
        
        const range = selection.getRangeAt(0);
        const text = selection.toString().trim();
        if (!text) return null;
        
        const selectionInfo = {
            text,
            isWord: text.match(/^\w+$/),
            context: '',
            rect: range.getBoundingClientRect(),
            range: range.cloneRange()
        };
        
        selectionInfo.context = this._getContext(range, text, analysisDepth);
        this.lastSelection = selectionInfo;
        return selectionInfo;
    }

    _getContext(range, text, analysisDepth) {
        let node = range.startContainer;
        if (analysisDepth === 'sentence') {
            const sentence = node.textContent.match(
                new RegExp(`[^.!?]*\\b${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b[^.!?]*[.!?]`, 'i')
            );
            return sentence ? sentence[0] : node.textContent;
        } else if (analysisDepth === 'paragraph') {
            while (node && node.nodeName !== 'P') node = node.parentNode;
            return node ? node.textContent : range.startContainer.textContent;
        }
        return document.body.innerText;
    }
}