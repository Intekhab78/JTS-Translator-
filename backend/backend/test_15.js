require('dotenv').config({ path: './.env' });
const { GoogleGenAI } = require('@google/genai');

async function test15() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = "Hello, how are you?";
    
    try {
        console.log("Sending request to gemini-1.5-flash...");
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });
        console.log("Success:", response.text);
    } catch (e) {
        console.error("Error:", e.message);
    }
}

test15();
