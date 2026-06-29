require('dotenv').config({ path: './.env' });
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const PDFDocument = require('pdfkit');

async function testGeminiPDF() {
    // 1. Create a dummy image-only PDF (we'll just use a blank one for now, or text converted to image, but a basic PDF is fine)
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream('dummy.pdf'));
    doc.text('This is a test document with some text.');
    doc.end();

    // wait a moment for the file to write
    await new Promise(resolve => setTimeout(resolve, 1000));

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    try {
        const fileBytes = fs.readFileSync('dummy.pdf');
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [
                {
                    inlineData: {
                        mimeType: 'application/pdf',
                        data: fileBytes.toString("base64")
                    }
                },
                "Extract all the text from this document."
            ]
        });
        
        console.log("Success! Extracted text:\n", response.text);
    } catch (e) {
        console.error("Error:", e);
    }
}

testGeminiPDF();
