const { GoogleGenAI } = require('@google/genai');

class QaService {
    constructor() {
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
            this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        } else {
            console.warn('GEMINI_API_KEY is missing, invalid, or still the placeholder. Q&A is disabled.');
        }
    }

    async answerQuestion(contextText, question, language = 'en') {
        if (!this.ai) {
            return "Q&A service is currently disabled (No API Key).";
        }

        const targetLanguage = language === 'auto' ? 'the same language used in the User Query' : language;

        try {
            const prompt = `You are a professional document analysis assistant. 
Your goal is to help the user understand the provided document.

Document Context:
${contextText}

User Query: ${question}

Instructions:
1. Answer the user's query accurately based on the document context.
2. If the user asks for a summary, provide a concise and clear summary.
3. If the user asks for "questions" or "suggestions", provide 3-5 relevant questions they can ask based on this document's content.
4. If the information is not present in the document, politely state that the document does not contain that specific information, but try to provide the most related details available.
5. Maintain a professional and helpful tone.
6. IMPORTANT: You must provide your ENTIRE response in: ${targetLanguage}.
`;
            
            const response = await this.ai.models.generateContent({
                model: 'gemini-flash-latest',
                contents: prompt,
            });

            return response.text;
        } catch (error) {
            console.error('Q&A API Error:', error.message);
            throw new Error('Failed to generate answer.');
        }
    }

    async generateResumeQuestions(contextText) {
        if (!this.ai) {
            return "Q&A service is currently disabled (No API Key).";
        }

        try {
            const prompt = `You are a professional interviewer and document analyzer.
The following text is extracted from a resume. 
Please analyze the resume and generate 3-5 engaging questions for the candidate.
The questions should range from basic (e.g., graduation year, location) to advanced (e.g., technical challenges in projects, specific skill application).

Resume Content:
${contextText}

Instructions:
1. Identify the candidate's name if possible and address them (or just say "Hello").
2. Provide a very brief (1 sentence) encouraging remark about their background.
3. List 3-5 questions clearly.
4. One question MUST be about a basic detail (like pass-out year or degree).
5. One or two questions MUST be about their projects or technical skills.
6. Format the response as a friendly message.
`;

            const response = await this.ai.models.generateContent({
                model: 'gemini-flash-latest',
                contents: prompt,
            });

            return response.text;
        } catch (error) {
            console.error('Resume Question Generation Error:', error.message);
            throw new Error('Failed to generate resume questions.');
        }
    }

    async extractTextFromPDF(filePath) {
        if (!this.ai) {
            return "";
        }

        try {
            const fs = require('fs');
            const fileBytes = fs.readFileSync(filePath);
            
            const response = await this.ai.models.generateContent({
                model: 'gemini-flash-latest',
                contents: [
                    {
                        inlineData: {
                            mimeType: 'application/pdf',
                            data: fileBytes.toString("base64")
                        }
                    },
                    "Extract and return all the text visible in this document accurately. Do not summarize, just extract the text."
                ]
            });

            return response.text;
        } catch (error) {
            console.error('PDF Extraction via Gemini Error:', error.message);
            return "";
        }
    }
}

module.exports = new QaService();
