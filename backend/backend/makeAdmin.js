require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB Atlas');
        const db = mongoose.connection.db;
        const result = await db.collection('users').updateMany(
            {},
            { $set: { isAdmin: true } }
        );
        console.log(`Updated ${result.modifiedCount} users to be admins.`);
        process.exit(0);
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
