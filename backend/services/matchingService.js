const { GoogleGenAI } = require('@google/genai');

class MatchingService {
    constructor() {
        if (process.env.GEMINI_API_KEY) {
            this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        } else {
            console.warn('GEMINI_API_KEY is missing. Matching service is disabled.');
        }
    }

    async checkMatch(resumeText, jobDescription) {
        if (!this.ai) {
            throw new Error('AI Service not configured');
        }

        try {
            const prompt = `You are a professional HR and recruitment assistant.
Your task is to compare the following Resume against the Job Description.

Job Description:
${jobDescription}

Resume:
${resumeText}

Instructions:
1. Determine if the candidate is a good match for the position.
2. Consider skills, experience, and education.
3. You MUST return ONLY valid JSON in the following format:
{
  "isMatch": boolean,
  "score": number (0-100),
  "reason": "A brief explanation of why they match or don't match."
}
4. Be strict but fair. If the core requirements are missing, it's not a match.
`;

            const response = await this.ai.models.generateContent({
                model: 'gemini-flash-latest',
                contents: prompt,
            });

            // Clean response text in case of markdown blocks
            let text = response.text;
            if (text.includes('```json')) {
                text = text.split('```json')[1].split('```')[0].trim();
            } else if (text.includes('```')) {
                text = text.split('```')[1].split('```')[0].trim();
            }

            return JSON.parse(text);
        } catch (error) {
            console.error('Matching API Error:', error.message);
            throw new Error('Failed to analyze match.');
        }
    }
}

module.exports = new MatchingService();
