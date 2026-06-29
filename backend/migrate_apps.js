const mongoose = require('mongoose');
const Application = require('./models/Application');
require('dotenv').config();

async function migrate() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/translator');
    
    // Update old applications that don't have isMatch field
    const result = await Application.updateMany(
        { isMatch: { $exists: false }, matchScore: { $gte: 80 } },
        { $set: { isMatch: true, status: 'accepted' } }
    );
    console.log(`Updated ${result.modifiedCount} applications to Matched`);

    const result2 = await Application.updateMany(
        { isMatch: { $exists: false }, matchScore: { $lt: 80 } },
        { $set: { isMatch: false, status: 'rejected' } }
    );
    console.log(`Updated ${result2.modifiedCount} applications to Mismatched`);

    process.exit();
}

migrate();
