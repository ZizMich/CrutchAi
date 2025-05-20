const youtubeHelper = new YouTubeHelper();

// Initialize when DOM is ready
function initializeHelper() {
    try {
        youtubeHelper.init();
    } catch (error) {
        console.error('Failed to initialize YouTubeHelper:', error);
    }
}

// Add multiple initialization points
document.addEventListener('DOMContentLoaded', initializeHelper);
window.addEventListener('load', initializeHelper);
window.addEventListener('yt-navigate-finish', initializeHelper);