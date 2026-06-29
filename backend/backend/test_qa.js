require('dotenv').config({ path: './.env' });
const qaService = require('./services/qaService');

async function run() {
    console.log("Testing generation...");
    const initial = await qaService.generateResumeQuestions("I am a software engineer with 5 years of experience in React and Node.js. I graduated from MIT in 2020.");
    console.log("Initial Questions:", initial);
    
    const answer = await qaService.answerQuestion("I am a software engineer with 5 years of experience in React and Node.js. I graduated from MIT in 2020.", "Where did they graduate from?");
    console.log("Answer:", answer);
}

run().catch(console.error);
