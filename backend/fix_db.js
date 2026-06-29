require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/translator').then(async () => {
    require('./models/Job.js');
    const App = require('./models/Application.js');
    const interviewService = require('./services/interviewService.js');
    
    const apps = await App.find({});
    for(let application of apps) {
        if (application.writtenInterview && Array.isArray(application.writtenInterview.questions) && application.writtenInterview.questions.length === 0) {
            await application.populate('jobId');
            console.log('Generating for', application._id);
            const questions = await interviewService.generateQuestions(
                application.resumeText, 
                application.jobId.description
            );
            application.writtenInterview = {
                questions,
                answers: [],
                status: 'pending'
            };
            await application.save();
            console.log('Fixed app', application._id);
        }
    }
    console.log('Done');
    process.exit(0);
});
