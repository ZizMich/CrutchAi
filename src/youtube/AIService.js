if (typeof window.AIService === 'undefined') {
    class AIService {
        constructor() {
            // No API key needed for basic translation
        }

        async translateText(text, targetLang) {
            try {
                const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
                const response = await fetch(url);
                const data = await response.json();
                
                // Extract translation from response
                return data[0].map(x => x[0]).join(' ');
            } catch (error) {
                console.error('Translation failed:', error);
                return text; // Return original text as fallback
            }
        }

        async generateQuiz(context, targetLang, count) {
            try {
                const response = await chrome.runtime.sendMessage({
                    type: 'generate_quiz',
                    content: context,
                    targetLang,
                    count
                });
                
                if (response?.result) {
                    // Clean up the response before parsing
                    let jsonText = response.result.trim();
                    // Remove markdown code blocks if present
                    if (jsonText.startsWith('```')) {
                        jsonText = jsonText
                            .replace(/^```json\n/, '')
                            .replace(/^```\n/, '')
                            .replace(/```$/, '')
                            .trim();
                    }

                    try {
                        return JSON.parse(jsonText);
                    } catch (parseError) {
                        console.error('Failed to parse quiz JSON:', parseError);
                        return null;
                    }
                }
                return null;
            } catch (error) {
                console.error('Quiz generation failed:', error);
                return null;
            }
        }

        formatResponse(text) {
            return text
                // Remove standalone * and #
                .replace(/([^*])\*([^*])/g, '$1$2')
                .replace(/([^#])#([^#])/g, '$1$2')
                // Keep proper markdown but remove excessive symbols
                .replace(/[*#]{3,}/g, '')
                // Format section headers properly
                .split('\n')
                .map(line => {
                    if (line.match(/^[#*]\s+[A-Z]/)) {
                        return '• ' + line.replace(/^[#*]\s+/, '');
                    }
                    return line;
                })
                .join('\n')
                .trim();
        }
    }
    window.AIService = AIService;
}