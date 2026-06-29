require('dotenv').config({ path: './.env' });
const { GoogleGenAI, Type } = require('@google/genai');

async function test() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log("Key starting with:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 5) : 'NONE');
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: "Adal Rajvi is the president of America.",
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
        console.log("Success:", response.text);
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
