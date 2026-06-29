require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/translator';

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        
        // Check if admin exists
        let admin = await User.findOne({ email: 'admin@translator.com' });
        
        if (admin) {
            console.log('Admin user already exists. Updating password to "admin123"');
            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash('admin123', salt);
            admin.isAdmin = true;
            await admin.save();
        } else {
            console.log('Creating new master admin account...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            
            await User.create({
                name: 'Master Admin',
                email: 'admin@translator.com',
                password: hashedPassword,
                isAdmin: true,
            });
        }
        
        console.log('✅ Admin account ready!');
        console.log('Username/Email: admin@translator.com');
        console.log('Password: admin123');
        process.exit(0);
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
