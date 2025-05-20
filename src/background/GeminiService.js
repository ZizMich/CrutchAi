export class GeminiService {
    constructor(apiKey) {
        this.API_KEY = apiKey;
        this.ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.API_KEY}`;
        this.langMap = {
            ru: 'Russian',
            en: 'English',
            es: 'Spanish',
            fr: 'French'
        };
    }

    _buildPrompt(text, context, targetLang, type) {
        if (type === 'video') return text;
        
        if (type === 'sentence') {
            return `Analyze and explain ONLY in ${targetLang || 'Russian'} this sentence: '${text}'
            Context: ${context}
            Provide ONLY in ${targetLang || 'Russian'}:
            1. Translation
            2. Meaning
            3. Grammar
            4. Key phrases
            5. Cultural notes`;
        }

        return `Analyze this word. Give ALL explanations ONLY in ${targetLang || 'Russian'}.
            Word: '${text}'
            Context: '${context}'
            Include:
            - Translation
            - Grammar
            - Usage examples
            - Style notes`;
    }

    _buildQuizPrompt(content, targetLang) {
        const lang = this.langMap[targetLang] || 'Russian';
        return `Parse this text and create a structured quiz in ${lang}:
"${content}"

Return ONLY valid JSON with exactly 4 questions:
- 2 multiple choice questions
- 1 text input question
- 1 flashcard

{
  "questions": [
    {
      "type": "choice",
      "question": "Multiple choice question",
      "answer": "Correct answer",
      "options": ["Correct", "Wrong1", "Wrong2"]
    },
    {
      "type": "text",
      "question": "Question requiring text input",
      "answer": "Expected answer"
    },
    {
      "type": "flashcard",
      "front": "Term or concept",
      "back": "Definition or explanation",
      "context": "Usage example"
    }
  ]
}

Use language: ${lang}. For text questions, focus on factual answers like dates, names, or specific terms.`;
    }

    async fetchAnalysis(text, context, targetLang, type = 'word') {
        const prompt = type === 'quiz' ? text : this._buildPrompt(text, context, targetLang, type);
        const body = { contents: [{ parts: [{ text: prompt }] }] };

        try {
            const res = await fetch(this.ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Origin": chrome.runtime.getURL(""),
                    "Access-Control-Request-Method": "POST",
                    "Access-Control-Request-Headers": "Content-Type"
                },
                mode: "cors",
                body: JSON.stringify(body)
            });
            const data = await res.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";
        } catch (error) {
            console.error('Gemini API error:', error);
            throw new Error("Failed to get AI response.");
        }
    }
}