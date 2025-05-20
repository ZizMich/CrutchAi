if (typeof window.TranscriptManager === 'undefined') {
    class TranscriptManager {
        constructor() {
            this.transcript = '';
            this.videoId = '';
        }

        async getTranscript() {
            try {
                const videoId = new URLSearchParams(window.location.search).get('v');
                if (videoId === this.videoId && this.transcript) return this.transcript;
                
                const transcriptButton = Array.from(document.querySelectorAll('button'))
                    .find(button => button.textContent.includes('Show transcript'));
                if (transcriptButton) {
                    transcriptButton.click();
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Extract transcript segments with timestamps
                    const transcriptItems = document.querySelectorAll('ytd-transcript-segment-renderer');
                    this.transcript = Array.from(transcriptItems).map(item => {
                        const timestamp = item.querySelector('.segment-timestamp');
                        const text = item.querySelector('.segment-text');
                        const time = this.parseTimestamp(timestamp?.textContent || '0:00');
                        
                        return {
                            text: text?.textContent?.trim() || '',
                            start: time,
                            end: time + 5 // Approximate 5-second segments
                        };
                    });
                    
                    this.videoId = videoId;
                }
                return this.transcript;
            } catch (error) {
                console.error('Failed to get transcript:', error);
                return [];
            }
        }

        parseTimestamp(timestamp) {
            const parts = timestamp.split(':').map(Number);
            if (parts.length === 2) {
                return parts[0] * 60 + parts[1];
            }
            if (parts.length === 3) {
                return parts[0] * 3600 + parts[1] * 60 + parts[2];
            }
            return 0;
        }

        extractContextAroundTimestamp(transcript, currentTime) {
            if (!Array.isArray(transcript)) return '';
            
            // Find segments around current time
            const relevantSegments = transcript.filter(segment => 
                Math.abs(segment.start - currentTime) <= 120 // 2 minutes window
            );

            return relevantSegments
                .map(segment => segment.text)
                .join(' ');
        }
    }
    window.TranscriptManager = TranscriptManager;
}