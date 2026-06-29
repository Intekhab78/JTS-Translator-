require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function testEmail() {
    console.log(`Testing login for: ${process.env.EMAIL_USER}`);
    console.log(`Using password: ${process.env.EMAIL_PASS}`);
    
    try {
        await transporter.verify();
        console.log("SUCCESS: Gmail accepted the password!");
    } catch (error) {
        console.error("\nERROR: Gmail blocked the login.");
        console.error("Reason: " + error.message);
        console.error("\nThis confirms you cannot use your regular Gmail password (Admin@123). You MUST generate a 16-letter App Password from your Google Account settings.");
    }
}

testEmail();
