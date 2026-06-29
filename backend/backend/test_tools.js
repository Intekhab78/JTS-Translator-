require('dotenv').config({ path: './.env' });
const { GoogleGenAI } = require('@google/genai');

async function testTools() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = "What is the latest news about Google Gemini?";
    
    try {
        console.log("Sending request to gemini-flash-latest with tools...");
        const response = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                tools: [{ googleSearch: {} }]
            }
        });
        console.log("Success:", response.text);
    } catch (e) {
        console.error("Error:", e.message);
    }
}

testTools();
