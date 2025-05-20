class UIManager {
  constructor() {
    this.speech = new SpeechManager();
    this.quiz = new QuizManager();
    // Initialize quiz language from storage
    chrome.storage.sync.get(['targetLang'], (data) => {
        this.quiz.setLanguage(data.targetLang || 'ru');
    });
    this.removeExistingPopups();
  }

  isSettingsPage() {
    return window.location.pathname.includes('popup.html') || 
           window.location.pathname.includes('html/popup.html') ||
           document.getElementById('ct-popup') !== null;
  }

  isQuizActive() {
    return document.querySelector('.ct-quiz-container[style*="display: block"]') !== null;
  }

  showTranslationPopup(result, rect) {
    this.removeExistingPopups();
    const popup = document.createElement('div');
    popup.className = 'ct-popup';
    const content = result.includes('error') || result.includes('Failed') ? result : formatContent(result);
    popup.innerHTML = `
      <div class="ct-popup-content">
        <div class="ct-popup-header">
          <div><button class="ct-speak">🔊</button><button class="ct-learn-button">📝</button></div>
          <button class="ct-close">×</button>
        </div>
        <div class="ct-result">${content}</div>
        <div class="ct-quiz-container" style="display:none"></div>
      </div>`;

    // Add this line to prevent new popups when selecting text inside
    popup.addEventListener('mouseup', (e) => e.stopPropagation());

    this._positionElement(popup, rect, 400, 300);
    document.body.appendChild(popup);
    popup.querySelector('.ct-speak').onclick = () => this.speech.toggleSpeech(content, popup.querySelector('.ct-speak'));
    popup.querySelector('.ct-learn-button').onclick = () => this.showLearningMode(content, popup);
    popup.querySelector('.ct-close').onclick = () => {
      this.speech.stopSpeech();
      this.removeExistingPopups();
    };
  }

  async showLearningMode(content, popup) {
    const resultDiv = popup.querySelector('.ct-result');
    const quizContainer = popup.querySelector('.ct-quiz-container');
    
    // Show loading state immediately but keep generating quiz
    resultDiv.style.display = 'none';
    quizContainer.style.display = 'block';
    quizContainer.innerHTML = '<div class="ct-loading">Generating quiz...</div>';
    
    // Generate quiz in background while showing loading state
    const quiz = await Promise.race([
      this.quiz.generateQuiz(content),
      this.quiz.generateFallbackQuiz(content) // Prepare fallback immediately
    ]);

    // If fallback was used, continue trying to get AI quiz in background
    if (!quiz.isAIGenerated) {
      this.quiz.generateQuiz(content).then(aiQuiz => {
        if (aiQuiz.questions?.length) {
          quizContainer.innerHTML = this.quiz.renderQuiz(aiQuiz);
          this.quiz.setupQuizHandlers(quizContainer, aiQuiz);
        }
      });
    }

    quizContainer.innerHTML = this.quiz.renderQuiz(quiz);
    this.quiz.setupQuizHandlers(quizContainer, quiz);
  }

  showActionButton(rect, onClick, selectionData) {
    this.removeExistingPopups();
    const btn = document.createElement('div');
    btn.className = 'ct-action-button';
    btn.innerHTML = '🔍 Analyze Text';
    this._positionElement(btn, rect, 100, 30, true);
    btn.style.background = '#2196F3';
    btn.style.color = 'white';
    btn.style.padding = '8px 16px';
    window.getSelection().removeAllRanges();
    btn.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.removeExistingPopups();
      if (!selectionData) {
        this.showTranslationPopup('Please select text again', rect);
        return;
      }
      await onClick(selectionData);
    };
    document.body.appendChild(btn);
    setTimeout(() => btn?.remove(), 5000);
  }

  _positionElement(el, rect, width, height, isButton = false) {
    const vw = window.innerWidth, vh = window.innerHeight;
    let left = isButton ? rect.right + window.scrollX + 5 : rect.left + window.scrollX;
    let top = isButton ? rect.top + window.scrollY - 30 : rect.bottom + window.scrollY + 5;
    if (left + width > vw) left = vw - (width + 20);
    if (!isButton && top + height > vh + window.scrollY) top = rect.top + window.scrollY - (height + 20);
    el.style.position = 'absolute';
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }

  removeExistingPopups() {
    document.querySelectorAll('.ct-popup, .ct-action-button').forEach(el => el.remove());
  }

  createFloatingIcon(isYouTubePage) {
    if (!document.getElementById('ct-history-icon') && !this.isSettingsPage()) {
      const icon = document.createElement('div');
      icon.id = 'ct-history-icon';
      icon.title = isYouTubePage ? 'Video Assistant' : 'ContextTranslate: History & Settings';
      icon.onclick = () => {
        try {
          if (isYouTubePage) youtubeHelper?.toggleChat();
          else chrome.runtime.sendMessage({ type: 'open_popup' });
        } catch (err) {
          console.error('Floating icon error:', err);
        }
      };
      document.body.appendChild(icon);
    }
  }
}