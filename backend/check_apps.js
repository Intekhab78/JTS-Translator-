const mongoose = require('mongoose');
const Application = require('./models/Application');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/translator');
    const apps = await Application.find().lean();
    console.log(JSON.stringify(apps.map(a => ({ id: a._id, score: a.matchScore, isMatch: a.isMatch })), null, 2));
    process.exit();
}

check();
