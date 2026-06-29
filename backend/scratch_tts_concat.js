const translate = require('google-translate-api-x');

async function testTTS() {
    try {
        const text = "This is a very long text. ".repeat(20);
        const targetLang = 'en';

        const words = text.split(' ');
        const chunks = [];
        let currentChunk = '';
        
        for (const word of words) {
            if ((currentChunk + ' ' + word).length <= 190) {
                currentChunk += (currentChunk ? ' ' : '') + word;
            } else {
                if (currentChunk) chunks.push(currentChunk);
                currentChunk = word;
            }
        }
        if (currentChunk) chunks.push(currentChunk);

        const audioBuffers = [];
        for (const chunk of chunks) {
            const base64Audio = await translate.speak(chunk, { to: targetLang });
            audioBuffers.push(Buffer.from(base64Audio, 'base64'));
        }
        
        const finalBuffer = Buffer.concat(audioBuffers);
        console.log("Success! Final Length:", finalBuffer.length);
    } catch (e) {
        console.error('Error:', e.message);
    }
}
testTTS();
