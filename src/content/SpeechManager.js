class SpeechManager {
  constructor() {
    this.speechSynthesis = window.speechSynthesis;
    this.voices = [];
    this.currentUtterance = null;
    this.isSpeaking = false;
    this.preferredVoices = {
      'en-US': 'Google US English',
      'ru-RU': 'Google русский',
      'zh-CN': 'Google 普通话（中国大陆）',
      'ja-JP': 'Google 日本語'
    };
    this.currentTargetLang = 'ru-RU';
    this._initVoices();
  }

  _initVoices() {
    const loadVoices = () => {
      this.voices = this.speechSynthesis.getVoices();
    };
    loadVoices();
    this.speechSynthesis.onvoiceschanged = loadVoices;
  }

  setTargetLanguage(lang) {
    this.currentTargetLang = lang;
  }

  speakText(text, btn, retry = 0) {
    this.stopSpeech();
    if ((!this.voices || this.voices.length === 0) && retry < 3) {
      setTimeout(() => this.speakText(text, btn, retry + 1), 500);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.currentTargetLang;
    utterance.text = text;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.voice = this._findBestVoice(this.voices, this.currentTargetLang);
    utterance.onstart = () => { this.isSpeaking = true; if (btn) btn.textContent = '⏹️'; };
    utterance.onend = utterance.onerror = () => {
      this.isSpeaking = false;
      if (btn) btn.textContent = '🔊';
      this.currentUtterance = null;
    };
    this.currentUtterance = utterance;
    this.speechSynthesis.speak(utterance);
  }

  _findBestVoice(voices, lang) {
    return voices.find(v => v.name === this.preferredVoices[lang] && !v.localService)
        || voices.find(v => v.name === this.preferredVoices[lang])
        || voices.find(v => v.lang === lang && !v.localService)
        || voices.find(v => v.lang === lang)
        || voices.find(v => v.lang.startsWith(lang.split('-')[0]) && !v.localService)
        || voices.find(v => v.lang.startsWith(lang.split('-')[0]));
  }

  stopSpeech() {
    if (this.speechSynthesis.speaking || this.speechSynthesis.pending) {
      this.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
  }

  toggleSpeech(text, btn) {
    if (this.isSpeaking) {
      this.stopSpeech();
      if (btn) btn.textContent = '🔊';
    } else {
      this.speakText(text, btn);
    }
  }
} 