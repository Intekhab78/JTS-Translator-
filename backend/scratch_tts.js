const translate = require('google-translate-api-x');

async function testTTS() {
    try {
        const res = await translate.speak('Bonjour le monde', { to: 'fr' });
        console.log("Audio Buffer length:", res.length);
        console.log("Audio Base64 start:", res.toString('base64').substring(0, 50));
    } catch (e) {
        console.error('Error:', e.message);
    }
}
testTTS();
