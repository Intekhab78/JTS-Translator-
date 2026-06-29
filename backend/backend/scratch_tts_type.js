const translate = require('google-translate-api-x');

async function testTTS() {
    try {
        const res = await translate.speak('Hello world', { to: 'en' });
        console.log("typeof res:", typeof res);
        console.log("Is Buffer?", Buffer.isBuffer(res));
        console.log("res constructor name:", res.constructor.name);
        console.log("Length:", res.length);
    } catch (e) {
        console.error('Error:', e.message);
    }
}
testTTS();
