const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    resumeText: {
        type: String,
        required: true
    },
    matchScore: {
        type: Number
    },
    isMatch: {
        type: Boolean
    },
    reason: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'scheduled'],
        default: 'pending'
    },
    interviewDate: {
        type: Date
    },
    interviewTime: {
        type: String
    },
    interviewMode: {
        type: String,
        enum: ['online', 'offline']
    },
    interviewLocation: {
        type: String
    },
    writtenInterview: {
        questions: [{ type: String }],
        answers: [{ type: String }],
        evaluation: {
            answerScores: [{ type: String }],
            overallScore: { type: Number }
        },
        status: {
            type: String,
            enum: ['pending', 'completed'],
            default: 'pending'
        },
        completedAt: { type: Date }
    }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
