export class ErrorManager {
    constructor() {
        this.errorDiv = document.getElementById('ct-error');
    }

    showError(message) {
        this.errorDiv.textContent = message;
        this.errorDiv.style.display = 'block';
        setTimeout(() => {
            this.errorDiv.style.display = 'none';
        }, 3000);
    }
}