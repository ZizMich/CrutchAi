class QuizManager {
  constructor() {
    this.templates = {
      'ru': [
        { template: 'Объясните значение термина «{topic}»:', weight: 1 },
        { template: 'Что означает «{topic}»?', weight: 1 },
        { template: 'Как бы вы определили понятие «{topic}»?', weight: 1 },
        { template: 'Раскройте смысл термина «{topic}»:', weight: 1 }
      ],
      
      'en': [
        { template: 'What is the {topic}?', weight: 1 },
        { template: 'Can you explain the {topic}?', weight: 1 },
        { template: 'Define the {topic}:', weight: 1 },
        { template: 'How would you describe the {topic}?', weight: 1 }
      ],
      'de': [
        { template: 'Was ist {topic}?', weight: 1 },
        { template: 'Können Sie {topic} erklären?', weight: 1 },
        { template: 'Definieren Sie {topic}:', weight: 1 }
      ],
      'fr': [
        { template: 'Qu\'est-ce que {topic}?', weight: 1 },
        { template: 'Pouvez-vous expliquer {topic}?', weight: 1 },
        { template: 'Définissez {topic}:', weight: 1 }
      ],
      'es': [
        { template: '¿Qué es {topic}?', weight: 1 },
        { template: '¿Puede explicar {topic}?', weight: 1 },
        { template: 'Defina {topic}:', weight: 1 }
      ]
    };
    this.buttonTexts = {
      'ru': 'Отправить ответы',
      'en': 'Submit Answers',
      'de': 'Antworten absenden',
      'fr': 'Soumettre les réponses',
      'es': 'Enviar respuestas'
    };
    this.booleanOptions = {
      'ru': { yes: 'Да', no: 'Нет' },
      'en': { yes: 'Yes', no: 'No' },
      'de': { yes: 'Ja', no: 'Nein' },
      'fr': { yes: 'Oui', no: 'Non' },
      'es': { yes: 'Sí', no: 'No' }
    };
    this.relatedQuestionTemplates = {
      'ru': 'Относится ли этот текст к «{text}»?',
      'en': 'Is this content related to "{text}"?',
      'de': 'Bezieht sich dieser Text auf "{text}"?',
      'fr': 'Ce contenu est-il lié à "{text}" ?',
      'es': '¿Este contenido está relacionado con "{text}"?'
    };
    this.currentLang = 'en';
  }

  setLanguage(lang) {
    this.currentLang = lang || 'en';
  }

  async generateQuiz(content) {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'generate_quiz',
        content,
        targetLang: this.currentLang
      });

      if (response?.result) {
        try {
          // Remove code block markers if present
          let jsonText = response.result.trim();
          if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/^```json/, '').replace(/```$/, '').trim();
          } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```/, '').replace(/```$/, '').trim();
          }
          const parsed = JSON.parse(jsonText);
          if (Array.isArray(parsed.questions)) {
            return {
              questions: parsed.questions.map(q => this._formatAIQuestion(q)).filter(Boolean),
              isAIGenerated: true
            };
          }
        } catch (e) {
          console.warn('AI quiz not valid JSON, using fallback.', e);
        }
      }
      return this.generateFallbackQuiz(content);
    } catch (err) {
      console.error('Quiz generation error:', err);
      return this.generateFallbackQuiz(content);
    }
  }

  _formatAIQuestion(q) {
    // Skip invalid questions
    if (!q.question || (!q.answer && !q.options?.length)) {
      return null;
    }

    if (q.type === 'flashcard') {
      // Skip invalid flashcards
      if (!q.front || !q.back) {
        return null;
      }
      return {
        type: 'flashcard',
        front: q.front,
        back: q.back,
        context: q.context || ''
      };
    }

    // Format regular questions
    const formattedQ = {
      type: q.type || 'choice',
      question: q.question,
      answer: q.answer || (q.options?.[0] || ''),
      options: [],
      explanation: q.explanation || ''
    };

    // Ensure we have valid options for choice questions
    if (formattedQ.type === 'choice') {
      if (Array.isArray(q.options) && q.options.length > 0) {
        formattedQ.options = q.options.filter(Boolean); // Remove empty options
      }
      if (!formattedQ.options.length) {
        formattedQ.options = this._generateFallbackOptions(formattedQ.answer);
      }
    }

    return formattedQ;
  }

  _generateFallbackOptions(correct) {
    if (!correct) return [];
    
    const options = [correct];
    const words = correct.split(' ');
    
    // Generate meaningful alternatives
    if (words.length > 2) {
      // Use parts of the correct answer
      options.push(words.slice(0, Math.ceil(words.length/2)).join(' '));
      options.push(words.slice(-Math.ceil(words.length/2)).join(' '));
    } else {
      // For short answers, create variations
      options.push(this.modifyText(correct));
      options.push(this.createVariation(correct));
    }

    return this.shuffleArray([...new Set(options.filter(Boolean))]);
  }

  generateFallbackQuiz(content) {
    if (!content) return { questions: [] };

    // Extract terms/phrases for questions
    const lines = content.split('\n').filter(line => line.trim() && !line.includes('http'));
    const terms = lines
      .map(line => {
        // Try to extract a term or phrase before the colon, or the first noun-like word
        const [beforeColon] = line.split(':');
        const match = beforeColon.match(/["«»]?([\wа-яА-ЯёЁ-]{3,})["«»]?/);
        return match ? match[1] : beforeColon.trim();
      })
      .filter(Boolean);

    // Use unique terms, max 3
    const uniqueTerms = [...new Set(terms)].slice(0, 3);

    // Use the rest of the line as the answer/detail
    const details = lines.map(line => {
      const parts = line.split(':');
      return parts.length > 1 ? parts.slice(1).join(':').trim() : '';
    });

    const quiz = { questions: [] };

    uniqueTerms.forEach((term, i) => {
      const detail = details[i] || '';
      if (term && detail) {
        quiz.questions.push({
          type: 'choice',
          question: this._formatQuestion(term, i + 1),
          answer: detail,
          options: this._generateFallbackOptions(detail)
        });
      }
    });

    // Add a flashcard if possible
    if (uniqueTerms[0] && details[0]) {
      quiz.questions.push({
        type: 'flashcard',
        front: uniqueTerms[0],
        back: details[0],
        context: lines[0]
      });
    }

    return quiz;
  }

  _formatQuestion(aiQuestion) {
    if (aiQuestion.type === 'flashcard') {
      return {
        type: 'choice',
        question: aiQuestion.front,
        answer: aiQuestion.back,
        options: this.generateContextualOptions(aiQuestion.back, aiQuestion.context),
        explanation: aiQuestion.context
      };
    }
    return aiQuestion;
  }

  generateContextualOptions(correct, context) {
    const options = [correct];
    
    // Generate alternatives based on context
    const contextWords = context.split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !correct.includes(word));
    
    // Create plausible but incorrect alternatives
    const alternatives = [];
    if (contextWords.length >= 2) {
      alternatives.push(contextWords.slice(0, 3).join(' '));
      alternatives.push(contextWords.slice(-3).join(' '));
    } else {
      alternatives.push(this.modifyText(correct));
      alternatives.push(this.createVariation(correct));
    }

    return this.shuffleArray([...new Set([correct, ...alternatives])]);
  }

  modifyText(text) {
    // Create meaningful variation based on language
    return this.currentLang === 'ru' ?
      text.replace(/[аеёиоуыэюя]/gi, 'е') :
      text.split(' ').reverse().join(' ');
  }

  createVariation(text) {
    // Create alternative keeping key words
    const words = text.split(' ');
    if (words.length > 2) {
      return [words[0], '...', words[words.length - 1]].join(' ');
    }
    return text.toUpperCase();
  }

  async evaluateAnswer(question, userAnswer) {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'evaluate_answer',
        question,
        userAnswer,
        targetLang: this.currentLang
      });

      return {
        isCorrect: response.isCorrect,
        explanation: response.explanation,
        feedback: response.feedback
      };
    } catch (err) {
      console.error('Failed to evaluate answer:', err);
      return this.fallbackEvaluateAnswer(question, userAnswer);
    }
  }

  fallbackEvaluateAnswer(question, userAnswer) {
    const normalize = str => str.toLowerCase().trim();
    return {
      isCorrect: normalize(userAnswer) === normalize(question.answer),
      explanation: null,
      feedback: null
    };
  }

  _getRandomTemplate() {
    const templates = this.templates[this.currentLang] || this.templates['en'];
    const totalWeight = templates.reduce((sum, t) => sum + t.weight, 0);
    let random = Math.random() * totalWeight;

    for (let template of templates) {
      random -= template.weight;
      if (random <= 0) return template.template;
    }
    return templates[0].template;
  }

  renderQuiz(quiz) {
    if (!quiz?.questions?.length) {
      return `<div class="ct-quiz-error">Loading...</div>`;
    }

    // Filter out invalid questions
    const validQuestions = quiz.questions.filter(q => 
      q && q.question && 
      (q.type === 'flashcard' ? (q.front && q.back) : q.answer)
    );

    if (!validQuestions.length) {
      return `<div class="ct-quiz-error">No valid questions generated.</div>`;
    }

    return `
      <div class="ct-quiz">
        ${validQuestions.map((q, i) => this.renderQuestion(q, i)).join('')}
        <button class="ct-submit-quiz">${this.buttonTexts[this.currentLang] || this.buttonTexts['en']}</button>
      </div>
    `;
  }

  renderQuestion(q, i) {
    // Ensure every question has either input field or options
    if (!q.type || !q.question) return '';

    let input = '';
    const questionText = q.question.trim();
    
    if (q.type === 'flashcard') {
      return `
        <div class="ct-quiz-flashcard" tabindex="0" style="margin-bottom:18px;">
          <div class="ct-flashcard-front"><b>${q.front || ''}</b></div>
          <div class="ct-flashcard-back">${q.back || ''}<br><small>${q.context || ''}</small></div>
        </div>
      `;
    }

    // For regular questions, always provide either text input or choice options
    if (q.type === 'text' || !q.options?.length) {
      input = `<input type="text" class="ct-quiz-input" data-qindex="${i}" placeholder="Your answer">`;
    } else {
      const options = Array.isArray(q.options) ? q.options : [q.answer || ''];
      input = `<div class="ct-quiz-options">${
        options.map((opt, j) => `
          <div class="ct-quiz-option" data-qindex="${i}" data-option="${j}">${opt || ''}</div>
        `).join('')
      }</div>`;
    }

    return `
      <div class="ct-quiz-question">
        <h4>${questionText}</h4>
        ${input}
      </div>
    `;
  }

  setupQuizHandlers(container, quiz) {
    container.querySelectorAll('.ct-quiz-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const qIndex = opt.dataset.qindex;
        container.querySelectorAll(`[data-qindex="${qIndex}"]`).forEach(el => el.classList.remove('selected'));
        opt.classList.add('selected');
      });
    });

    container.querySelector('.ct-submit-quiz').addEventListener('click', () => {
      const results = quiz.questions.map((q, i) => {
        let userAnswer = '', isCorrect = false;
        switch (q.type) {
          case 'text':
            const inputField = container.querySelector(`input[data-qindex="${i}"]`);
            userAnswer = inputField ? inputField.value.trim() : '';
            isCorrect = this._compareAnswers(userAnswer, q.answer);
            break;
          case 'choice':
            const selected = container.querySelector(`.ct-quiz-option.selected[data-qindex="${i}"]`);
            userAnswer = selected?.textContent.trim() || '';
            isCorrect = this._compareAnswers(userAnswer, q.answer);
            break;
          case 'boolean':
            const boolSel = container.querySelector(`.ct-quiz-option.selected[data-qindex="${i}"]`);
            userAnswer = boolSel?.dataset.option || '';
            isCorrect = userAnswer === q.answer;
            break;
        }
        return { 
          question: q, 
          userAnswer: userAnswer || '(no answer)', 
          isCorrect: Boolean(userAnswer) && isCorrect 
        };
      });

      this.showQuizResults(container, results);
    });
  }

  _compareAnswers(userAnswer, correctAnswer) {
    if (!userAnswer || !correctAnswer) return false;
    // Normalize answers for comparison
    const normalize = (str) => str.toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[.,!?;:'"]/g, '');
    return normalize(userAnswer) === normalize(correctAnswer);
  }

  showQuizResults(container, results) {
    // Filter out results with undefined questions or answers
    const validResults = results.filter(r => 
      r.question && 
      typeof r.question.question === 'string' &&
      typeof r.question.answer === 'string'
    );

    const score = validResults.filter(r => r.isCorrect).length;
    const total = validResults.length;

    container.innerHTML = `
      <div class="ct-quiz-results">
        <h3>${this.getScoreText(score, total)}</h3>
        ${validResults.map(r => `
          <div class="ct-quiz-answer ${r.isCorrect ? 'correct' : 'incorrect'}">
            <div>${r.question.question}</div>
            <div>${this.getAnswerText()}: ${r.userAnswer || '(no answer)'}</div>
            <div>${this.getCorrectAnswerText()}: ${r.question.answer}</div>
            ${!r.isCorrect ? `
              <div class="ct-explanation">
                ${this.getHintText(this.currentLang)}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>`;
  }

  getHintText(lang) {
    const hints = {
      'en': 'Try to understand the context better.',
      'ru': 'Попробуйте лучше понять контекст.',
      'de': 'Versuchen Sie, den Kontext besser zu verstehen.',
      'fr': 'Essayez de mieux comprendre le contexte.',
      'es': 'Trate de entender mejor el contexto.'
    };
    return hints[lang] || hints['en'];
  }

  getScoreText(score, total) {
    const texts = {
      'en': `Score: ${score}/${total}`,
      'ru': `Результат: ${score}/${total}`,
      'de': `Punktzahl: ${score}/${total}`,
      'fr': `Score: ${score}/${total}`,
      'es': `Puntuación: ${score}/${total}`
    };
    return texts[this.currentLang] || texts['en'];
  }

  getAnswerText() {
    const texts = {
      'en': 'Your answer',
      'ru': 'Ваш ответ',
      'de': 'Ihre Antwort',
      'fr': 'Votre réponse',
      'es': 'Tu respuesta'
    };
    return texts[this.currentLang] || texts['en'];
  }

  getCorrectAnswerText() {
    const texts = {
      'en': 'Correct answer',
      'ru': 'Правильный ответ',
      'de': 'Richtige Antwort',
      'fr': 'Réponse correcte',
      'es': 'Respuesta correcta'
    };
    return texts[this.currentLang] || texts['en'];
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}