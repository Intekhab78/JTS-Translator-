require('dotenv').config({ path: './.env' });
const { GoogleGenAI } = require('@google/genai');

async function listModels() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    try {
        const models = await ai.models.list();
        console.log("Models:", JSON.stringify(models, null, 2));
    } catch (e) {
        console.error("Error listing models:", e);
    }
}

listModels();
