require('dotenv').config({ path: './.env' });
const { GoogleGenAI } = require('@google/genai');

async function testLite() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = "Hello, how are you?";
    
    try {
        console.log("Sending request to gemini-2.0-flash-lite...");
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-lite',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });
        console.log("Success:", response.text);
    } catch (e) {
        console.error("Error:", e.message);
    }
}

testLite();
