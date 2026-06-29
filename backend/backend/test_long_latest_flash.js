require('dotenv').config({ path: './.env' });
const { GoogleGenAI } = require('@google/genai');

async function testLongLatestFlash() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const contextText = "This is a test document about artificial intelligence. ".repeat(1000); 
    const question = "give more depth question";
    
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
`;

    try {
        console.log("Sending request to gemini-flash-latest with long context...");
        const response = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });
        console.log("Success:", response.text);
    } catch (e) {
        console.error("Error:", e.message);
    }
}

testLongLatestFlash();
