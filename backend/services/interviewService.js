const { GoogleGenAI } = require('@google/genai');

class InterviewService {
    constructor() {
        if (process.env.GEMINI_API_KEY) {
            this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        } else {
            console.warn('GEMINI_API_KEY is missing. Interview service is disabled.');
        }
    }

    async generateQuestions(resumeText, jobDescription) {
        if (!this.ai) {
            throw new Error('AI Service not configured');
        }

        try {
            const prompt = `You are an expert technical interviewer and HR professional.
Your task is to generate 5 to 8 interview questions for a candidate based on their Resume and the Job Description.

Job Description:
${jobDescription}

Resume:
${resumeText}

Instructions:
1. Generate between 5 and 8 questions.
2. The questions should be a mix of technical (if applicable) and behavioral questions.
3. Tailor the questions to the candidate's experience and the job requirements.
4. You MUST return ONLY valid JSON in the following format:
{
  "questions": [
    "Question 1?",
    "Question 2?",
    ...
  ]
}
5. Do not include any other text, markdown blocks, or explanation outside the JSON.`;

            const response = await this.ai.models.generateContent({
                model: 'gemini-flash-latest',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                }
            });

            let text = response.text;
            if (text.includes('```json')) {
                text = text.split('```json')[1].split('```')[0].trim();
            } else if (text.includes('```')) {
                text = text.split('```')[1].split('```')[0].trim();
            }

            const data = JSON.parse(text);
            const questions = data.questions || data.Questions || [];
            
            if (!Array.isArray(questions) || questions.length === 0) {
                console.warn('AI did not return an array of questions. Raw response:', text);
                return [
                    "Could you please walk us through your most recent experience?",
                    "What are your core strengths relevant to this role?",
                    "Can you describe a challenging project you worked on and how you overcame obstacles?",
                    "Where do you see your career progressing in the next few years?",
                    "Why are you interested in this specific position?"
                ];
            }
            
            return questions;
        } catch (error) {
            console.error('Interview API Error:', error.message);
            // Provide a fallback instead of failing completely
            return [
                "Could you please walk us through your most recent experience?",
                "What are your core strengths relevant to this role?",
                "Can you describe a challenging project you worked on and how you overcame obstacles?",
                "Where do you see your career progressing in the next few years?",
                "Why are you interested in this specific position?"
            ];
        }
    }

    async evaluateAnswers(questions, answers, jobDescription) {
        if (!this.ai) {
            console.warn('AI Service not configured, skipping evaluation.');
            return { answerScores: answers.map(() => 'AI evaluation unavailable.'), overallScore: 0 };
        }

        try {
            let qaPairs = '';
            for(let i = 0; i < questions.length; i++) {
                qaPairs += `Question ${i+1}: ${questions[i]}\nAnswer ${i+1}: ${answers[i] || 'No answer provided.'}\n\n`;
            }

            const prompt = `You are an expert technical interviewer and HR professional.
Your task is to evaluate a candidate's written interview answers based on the Job Description.

Job Description:
${jobDescription}

Interview Q&A:
${qaPairs}

Instructions:
1. Evaluate each answer. Provide a correctness percentage (0-100) and a brief 1-2 sentence feedback. Format it like "85% - Good answer, but missed X."
2. Calculate an overall correctness percentage for the entire interview (0-100).
3. You MUST return ONLY valid JSON in the following format:
{
  "answerScores": [
    "85% - Feedback...",
    "90% - Feedback..."
  ],
  "overallScore": 88
}
4. Ensure the length of answerScores matches the number of questions.
5. Do not include any other text, markdown blocks, or explanation outside the JSON.`;

            const response = await this.ai.models.generateContent({
                model: 'gemini-flash-latest',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                }
            });

            let text = response.text;
            if (text.includes('```json')) {
                text = text.split('```json')[1].split('```')[0].trim();
            } else if (text.includes('```')) {
                text = text.split('```')[1].split('```')[0].trim();
            }

            const data = JSON.parse(text);
            return {
                answerScores: data.answerScores || data.AnswerScores || answers.map(() => 'Evaluation error'),
                overallScore: data.overallScore || data.OverallScore || 0
            };
        } catch (error) {
            console.error('Interview Evaluation API Error:', error.message);
            return { answerScores: answers.map(() => 'Failed to evaluate.'), overallScore: 0 };
        }
    }
}

module.exports = new InterviewService();
