require('dotenv').config(); 
const { GoogleGenAI } = require('@google/genai'); 
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 

const prompt = `You are an expert technical interviewer and HR professional.
Your task is to generate 5 to 8 interview questions for a candidate based on their Resume and the Job Description.

Job Description:
Software Developer

Resume:
Experienced dev

Instructions:
1. Generate between 5 and 8 questions.
2. The questions should be a mix of technical (if applicable) and behavioral questions.
3. Tailor the questions to the candidate's experience and the job requirements.
4. You MUST return ONLY valid JSON in the following format:
{
  "questions": [
    "Question 1?",
    "Question 2?"
  ]
}
5. Do not include any other text, markdown blocks, or explanation outside the JSON.`;

ai.models.generateContent({ model: 'gemini-flash-latest', contents: prompt }).then(res => {
    console.log('RAW_TEXT:', res.text);
}).catch(console.error);
