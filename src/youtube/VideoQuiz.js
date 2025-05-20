if (typeof window.VideoQuiz === "undefined") {
    class VideoQuiz {
        constructor(chatUI, aiService) {
            this.chatUI = chatUI;
            this.aiService = aiService;
            this.currentQuiz = null;
            this.currentQuestionIndex = 0;
        }

        async startQuiz(transcript, currentTime, targetLang, numQuestions = 3) {
            const transcriptManager = new TranscriptManager();
            const context = transcriptManager.extractContextAroundTimestamp(transcript, currentTime);
            
            const quiz = await this.aiService.generateQuiz(context, targetLang, numQuestions);
            
            if (quiz) {
                this.currentQuiz = quiz;
                this.currentQuestionIndex = 0;
                this.askNextQuestion();
            } else {
                this.chatUI.addMessage('Failed to generate valid quiz questions. Please try again.', 'ai');
            }
        }

        askNextQuestion() {
            if (!this.currentQuiz?.questions?.[this.currentQuestionIndex]) {
                this.chatUI.addMessage('Quiz completed! Thanks for participating.', 'ai');
                this.currentQuiz = null;
                return;
            }

            const question = this.currentQuiz.questions[this.currentQuestionIndex];
            const questionNum = this.currentQuestionIndex + 1;

            // Handle flashcard type
            if (question.type === 'flashcard') {
                if (!question.front || !question.back) {
                    this.currentQuestionIndex++;
                    this.askNextQuestion();
                    return;
                }
                const messageText = `Question ${questionNum}: What do you know about "${question.front}"?\n\n(Please type your answer)`;
                this.chatUI.addMessage(messageText, 'ai');
                return;
            }

            // Handle regular questions
            if (!question?.question) {
                console.error('Invalid question format:', question);
                this.currentQuestionIndex++;
                this.askNextQuestion();
                return;
            }

            let messageText = `Question ${questionNum}: ${question.question}`;
            if (question.type === 'choice' && Array.isArray(question.options) && question.options.length > 0) {
                const optionsText = question.options
                    .map((opt, i) => `${i + 1}) ${opt}`)
                    .join('\n');
                messageText += `\n\n${optionsText}`;
            } else {
                messageText += '\n\n(Please type your answer)';
            }

            this.chatUI.addMessage(messageText, 'ai');
        }

        async checkQuizAnswer(userInput) {
            const currentQ = this.currentQuiz?.questions?.[this.currentQuestionIndex];
            if (!currentQ) {
                this.currentQuestionIndex++;
                this.askNextQuestion();
                return;
            }

            // Handle flashcard answers
            if (currentQ.type === 'flashcard') {
                const normalize = str => str?.toLowerCase?.().trim() || '';
                const userAnswer = normalize(userInput);
                const correctAnswer = normalize(currentQ.back);
                
                const isCorrect = userAnswer.includes(correctAnswer) || correctAnswer.includes(userAnswer);
                this.chatUI.addMessage(
                    `Your answer: ${userInput}\n\nCorrect explanation: ${currentQ.back}` +
                    (currentQ.context ? `\nContext: ${currentQ.context}` : ''),
                    'ai'
                );
                
                this.currentQuestionIndex++;
                setTimeout(() => this.askNextQuestion(), 1500);
                return;
            }

            // Rest of the answer checking logic
            const normalize = str => str?.toLowerCase?.().trim() || '';
            const userAnswer = normalize(userInput);
            const correctAnswer = normalize(currentQ.answer);

            let isCorrect = false;
            if (currentQ.type === 'choice' && Array.isArray(currentQ.options)) {
                // For multiple choice, check if answer matches any option exactly
                const optionIndex = parseInt(userInput) - 1;
                if (!isNaN(optionIndex) && currentQ.options[optionIndex]) {
                    isCorrect = normalize(currentQ.options[optionIndex]) === correctAnswer;
                } else {
                    isCorrect = userAnswer === correctAnswer;
                }
            } else {
                // For text input, do a more flexible comparison
                isCorrect = userAnswer.includes(correctAnswer) || correctAnswer.includes(userAnswer);
            }

            const feedback = isCorrect ? 
                'Correct! ✓' : 
                `Not quite. The correct answer is: ${currentQ.answer}`;
            
            this.chatUI.addMessage(feedback, 'ai');
            
            this.currentQuestionIndex++;
            setTimeout(() => this.askNextQuestion(), 1500);
        }
    }
    window.VideoQuiz = VideoQuiz;
}