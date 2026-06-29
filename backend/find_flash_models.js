require('dotenv').config({ path: './.env' });
const { GoogleGenAI } = require('@google/genai');

async function findModels() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    try {
        const response = await ai.models.list();
        for (const key of Object.keys(response)) {
            if (Array.isArray(response[key])) {
                console.log("All Models:", response[key].map(m => m.name));
                return;
            }
        }
    } catch (e) {
        console.error("Error listing models:", e);
    }
}

findModels();
