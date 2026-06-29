const { GoogleGenAI, Type } = require('@google/genai');

class FactCheckService {
    constructor() {
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
            this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        } else {
            console.warn('GEMINI_API_KEY is missing, invalid, or still the placeholder. Fact-checking is disabled.');
        }
    }

    async checkStatement(text) {
        if (!this.ai) {
            return { status: 'unverified', reason: 'Fact-checking disabled (No API Key)' };
        }
        
        if (!text || text.trim().length < 10) {
            return null; // Don't check very short phrases
        }

        try {
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: text,
                config: {
                    tools: [{ googleSearch: {} }],
                    systemInstruction: `You are a real-time fact-checking assistant. The current date is ${new Date().toISOString()}. Evaluate if the factual claims in the text are True, False, or Unverified (opinions, questions, subjective, or lack context).
You MUST return ONLY valid JSON in the following format, with no markdown formatting or blockquotes:
{
  "status": "true" | "false" | "unverified",
  "reason": "A concise 1-sentence explanation."
}`,
                    temperature: 0.1
                }
            });

            let content = response.text.trim();
            if (content.startsWith('```json')) {
                content = content.replace(/^```json\n?/, '').replace(/\n?```$/, '');
            } else if (content.startsWith('```')) {
                content = content.replace(/^```\n?/, '').replace(/\n?```$/, '');
            }
            try {
                return JSON.parse(content);
            } catch (e) {
                console.error('Failed to parse fact check JSON:', content);
                return { status: 'unverified', reason: 'Failed to process fact check result.' };
            }
        } catch (error) {
            console.error('Fact-checking API Error:', error.message);
            return { status: 'unverified', reason: 'Error connecting to fact-check service.' };
        }
    }
}

module.exports = new FactCheckService();
