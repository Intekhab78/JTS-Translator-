const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Job = require('../models/Job');
const Application = require('../models/Application');
const matchingService = require('../services/matchingService');
const interviewService = require('../services/interviewService');
const nodemailer = require('nodemailer');

const upload = multer({ dest: 'uploads/' });

// Get all active jobs
router.get('/current', async (req, res) => {
    try {
        const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new job
router.post('/create', async (req, res) => {
    try {
        const { title, description } = req.body;
        const newJob = await Job.create({ title, description });
        res.json(newJob);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete job
router.delete('/:id', async (req, res) => {
    try {
        await Job.findByIdAndDelete(req.params.id);
        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Submit application
router.post('/apply', upload.single('file'), async (req, res) => {
    const filePath = req.file ? req.file.path : null;
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const { jobId, userId } = req.body;
        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ error: 'Job not found' });

        let extractedText = '';
        const mimetype = req.file.mimetype;
        const originalName = req.file.originalname;
        const ext = originalName.split('.').pop().toLowerCase();

        if (mimetype.includes('pdf') || ext === 'pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer);
            extractedText = data.text;
        } else if (mimetype.includes('word') || ext === 'docx') {
            const result = await mammoth.extractRawText({ path: filePath });
            extractedText = result.value;
        } else {
            extractedText = fs.readFileSync(filePath, 'utf8');
        }

        const matchResult = await matchingService.checkMatch(extractedText, job.description);

        // Save application regardless of match status
        const application = await Application.create({
            userId,
            jobId,
            resumeText: extractedText,
            matchScore: matchResult.score,
            isMatch: matchResult.isMatch,
            reason: matchResult.reason,
            status: matchResult.isMatch ? 'accepted' : 'rejected'
        });

        if (!matchResult.isMatch) {
            return res.json({ 
                success: true, // We still say true because the application was "received" and saved
                isMatch: false,
                message: 'Your resume has been submitted, but it does not closely match the job description.',
                reason: matchResult.reason 
            });
        }

        res.json({ 
            success: true, 
            isMatch: true,
            message: 'Your resume has been submitted successfully and matches the requirements!' 
        });

    } catch (error) {
        console.error('Apply Error:', error);
        res.status(500).json({ error: error.message });
    } finally {
        if (filePath) {
            try { fs.unlinkSync(filePath); } catch (e) {}
        }
    }
});

// Get all applications (Admin)
router.get('/applications', async (req, res) => {
    try {
        const apps = await Application.find()
            .populate('userId', 'name email')
            .populate('jobId', 'title')
            .sort({ createdAt: -1 });
        res.json(apps);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Schedule interview
router.post('/applications/:id/schedule', async (req, res) => {
    try {
        const { date, time, mode, location, customMessage } = req.body;
        const application = await Application.findById(req.params.id)
            .populate('userId')
            .populate('jobId');

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        application.status = 'scheduled';
        application.interviewDate = date;
        application.interviewTime = time;
        application.interviewMode = mode;
        application.interviewLocation = location;
        await application.save();

        // Send email
        const isGmail = (process.env.EMAIL_USER || '').includes('gmail.com');
        const transporter = nodemailer.createTransport(isGmail ? {
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        } : {
            host: 'mail.jtsmiddleeast.com', // custom domain SMTP
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        let locationDetails = mode === 'online' 
            ? `Meeting Link: ${location}` 
            : `Location: ${location}`;

        const mailOptions = {
            from: process.env.EMAIL_USER || 'test@example.com',
            to: application.userId.email,
            subject: `Interview Scheduled for ${application.jobId.title}`,
            text: customMessage || `Dear ${application.userId.name},\n\nWe are pleased to inform you that your interview for the position of ${application.jobId.title} has been scheduled.\n\nDate: ${new Date(date).toLocaleDateString()}\nTime: ${time}\nMode: ${mode === 'online' ? 'Online Video Call' : 'In-Person / Offline'}\n${locationDetails}\n\nWe look forward to speaking with you.\n\nBest regards,\nThe Hiring Team`
        };

        // Try to send email, but don't fail the request if it fails (unless we really want to)
        try {
            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                await transporter.sendMail(mailOptions);
            } else {
                console.log('Mock Email sent to', application.userId.email, mailOptions.text);
            }
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
            // We still return success since the DB is updated
        }

        res.json({ message: 'Interview scheduled successfully', application });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get my applications
router.get('/my-applications/:userId', async (req, res) => {
    try {
        const apps = await Application.find({ userId: req.params.userId })
            .populate('jobId', 'title description')
            .sort({ createdAt: -1 });
        res.json(apps);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate interview questions
router.post('/applications/:id/generate-interview', async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('jobId');

        if (!application) return res.status(404).json({ error: 'Application not found' });

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

        res.json({ message: 'Interview questions generated', application });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Submit interview answers
router.post('/applications/:id/submit-interview', async (req, res) => {
    try {
        const { answers } = req.body;
        const application = await Application.findById(req.params.id).populate('jobId');

        if (!application) return res.status(404).json({ error: 'Application not found' });

        if (!application.writtenInterview || !application.writtenInterview.questions || application.writtenInterview.questions.length === 0) {
             return res.status(400).json({ error: 'No written interview found for this application' });
        }

        const evaluation = await interviewService.evaluateAnswers(
            application.writtenInterview.questions,
            answers,
            application.jobId.description
        );

        application.writtenInterview.answers = answers;
        application.writtenInterview.evaluation = evaluation;
        application.writtenInterview.status = 'completed';
        application.writtenInterview.completedAt = new Date();

        await application.save();

        res.json({ message: 'Interview submitted successfully', application });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
