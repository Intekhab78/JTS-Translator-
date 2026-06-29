const translate = require('google-translate-api-x');

async function testTTS() {
    try {
        const longText = "This is a very long text. ".repeat(20);
        console.log("Text length:", longText.length);
        const res = await translate.speak(longText, { to: 'en' });
        console.log("Success! Length:", res.length);
    } catch (e) {
        console.error('Error:', e.message);
    }
}
testTTS();
