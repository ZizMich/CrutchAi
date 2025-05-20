class AsyncVoice {
    constructor(targetLang = 'en') {
        this.targetLang = targetLang;
        this.audioQueue = [];
        this.isPlaying = false;
        this.currentUtterance = null;
        this.synth = window.speechSynthesis;
        this.voice = null;
        this.videoElement = null;
        this.lastPlayedTime = 0;
        this.setupVoice();
        this.setupVideoListeners();
    }

    setupVoice() {
        // Wait for voices to be loaded
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => {
                const voices = this.synth.getVoices();
                // Find a voice for target language
                this.voice = voices.find(v => v.lang.startsWith(this.targetLang)) || 
                            voices.find(v => v.lang.startsWith(this.targetLang.split('-')[0])) ||
                            voices[0];
            };
        }
    }

    setupVideoListeners() {
        const videoElement = document.querySelector('video');
        if (!videoElement) return;
        
        this.videoElement = videoElement;
        
        videoElement.addEventListener('play', () => this.onVideoPlay());
        videoElement.addEventListener('pause', () => this.onVideoPause());
        videoElement.addEventListener('seeking', () => this.onVideoSeek());
        videoElement.addEventListener('timeupdate', () => this.onTimeUpdate());
    }

    onVideoPlay() {
        if (this.isPlaying) {
            this.synth.resume();
            this.playAtCurrentTime();
        }
    }

    onVideoPause() {
        if (this.isPlaying) {
            this.synth.pause();
        }
    }

    onVideoSeek() {
        if (this.isPlaying) {
            this.synth.cancel();
            this.currentUtterance = null;
            this.lastPlayedTime = 0;
            this.playAtCurrentTime();
        }
    }

    onTimeUpdate() {
        if (!this.isPlaying || !this.videoElement) return;
        
        const currentTime = this.videoElement.currentTime;
        // Check if we've moved more than 0.5 seconds
        if (Math.abs(currentTime - this.lastPlayedTime) > 0.5) {
            this.playAtCurrentTime();
        }
    }

    async prepareTranslation(transcript, aiService) {
        if (!Array.isArray(transcript)) {
            console.error('Invalid transcript format');
            return;
        }

        this.audioQueue = [];
        const chunks = this.splitTranscriptIntoChunks(transcript);

        for (let chunk of chunks) {
            try {
                const translation = await aiService.translateText(chunk.text, this.targetLang);
                this.audioQueue.push({
                    text: translation,
                    startTime: chunk.startTime,
                    endTime: chunk.endTime
                });
            } catch (error) {
                console.error('Chunk translation failed:', error);
            }
        }
    }

    splitTranscriptIntoChunks(transcript, maxLength = 200) {
        const chunks = [];
        let currentChunk = { text: '', startTime: 0, endTime: 0 };
        let wordCount = 0;
        
        for (let entry of transcript) {
            const words = entry.text.split(' ').length;
            
            if (wordCount + words > maxLength) {
                if (currentChunk.text) {
                    chunks.push({ ...currentChunk });
                }
                currentChunk = {
                    text: entry.text,
                    startTime: entry.start,
                    endTime: entry.end
                };
                wordCount = words;
            } else {
                currentChunk.text += ' ' + entry.text;
                if (!currentChunk.startTime) currentChunk.startTime = entry.start;
                currentChunk.endTime = entry.end;
                wordCount += words;
            }
        }
        
        if (currentChunk.text) {
            chunks.push(currentChunk);
        }
        
        return chunks;
    }

    playAt(videoTime) {
        if (!this.isPlaying) return;

        const currentAudio = this.audioQueue.find(audio => 
            videoTime >= audio.startTime && videoTime <= audio.endTime
        );

        if (currentAudio && (!this.currentUtterance || this.currentUtterance.text !== currentAudio.text)) {
            this.synth.cancel();
            this.currentUtterance = new SpeechSynthesisUtterance(currentAudio.text);
            this.currentUtterance.lang = this.targetLang;
            if (this.voice) this.currentUtterance.voice = this.voice;
            this.currentUtterance.rate = 1.1; // Slightly faster to keep up with video
            this.currentUtterance.onend = () => this.currentUtterance = null;
            this.synth.speak(this.currentUtterance);
        }
    }

    playAtCurrentTime() {
        if (!this.videoElement) return;
        
        const currentTime = this.videoElement.currentTime;
        this.lastPlayedTime = currentTime;
        
        const currentAudio = this.audioQueue.find(audio => 
            currentTime >= audio.startTime && currentTime <= audio.endTime
        );

        if (currentAudio && (!this.currentUtterance || this.currentUtterance.text !== currentAudio.text)) {
            this.synth.cancel();
            this.currentUtterance = new SpeechSynthesisUtterance(currentAudio.text);
            this.currentUtterance.lang = this.targetLang;
            if (this.voice) this.currentUtterance.voice = this.voice;
            
            // Calculate how far into the segment we are
            const segmentProgress = (currentTime - currentAudio.startTime) / 
                                 (currentAudio.endTime - currentAudio.startTime);
            
            // Adjust rate to catch up if needed
            this.currentUtterance.rate = segmentProgress > 0.3 ? 1.2 : 1.0;
            
            this.currentUtterance.onend = () => {
                this.currentUtterance = null;
                this.lastPlayedTime = currentTime;
            };

            this.synth.speak(this.currentUtterance);
        }
    }

    start() {
        this.isPlaying = true;
        if (this.videoElement) {
            this.videoElement.muted = true;
            this.playAtCurrentTime();
        }
    }

    stop() {
        this.isPlaying = false;
        this.synth.cancel();
        this.currentUtterance = null;
        this.lastPlayedTime = 0;
        if (this.videoElement) {
            this.videoElement.muted = false;
        }
    }

    setTargetLanguage(lang) {
        this.targetLang = lang;
    }
}

window.AsyncVoice = AsyncVoice;
