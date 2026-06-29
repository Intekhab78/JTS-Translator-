require('dotenv').config();
const { createClient } = require('@deepgram/sdk');
const fs = require('fs');

async function test() {
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
    try {
        const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
            { url: 'https://static.deepgram.com/examples/hello.mp3' },
            { model: 'nova-2' }
        );
        if (error) {
            console.error('Deepgram Error:', error);
        } else {
            console.log('Deepgram Success:', result.results.channels[0].alternatives[0].transcript);
        }
    } catch (err) {
        console.error('Deepgram Exception:', err);
    }
}

test();
