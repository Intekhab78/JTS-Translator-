require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const sttService = require('./services/sttService');
const translationService = require('./services/translationService');
const factCheckService = require('./services/factCheckService');
const qaService = require('./services/qaService');
const translate = require('google-translate-api-x');
const Transcript = require('./models/Transcript');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const jobRoutes = require('./routes/jobRoutes');

const app = express();
const server = http.createServer(app);
const upload = multer({ dest: 'uploads/' });
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/job', jobRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Translator Backend is running!', status: 'Healthy' });
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
    const filePath = req.file ? req.file.path : null;
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { sourceLang, targetLang } = req.body;
        let mimetype = req.file.mimetype;
        const originalName = req.file.originalname;

        // Debug logging
        try {
            fs.appendFileSync('stt_debug.log', `\n[${new Date().toISOString()}] REQ.FILE: ${JSON.stringify(req.file, null, 2)}\n`);
        } catch (e) { }

        console.log(`Upload started: ${originalName} (${mimetype}), Size: ${req.file.size} bytes`);

        // Robust mimetype detection fallback based on extension
        if (mimetype === 'application/octet-stream' || !mimetype) {
            const ext = originalName.split('.').pop().toLowerCase();
            const mimeMap = {
                'pdf': 'application/pdf',
                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'txt': 'text/plain',
                'mp3': 'audio/mpeg',
                'wav': 'audio/wav',
                'ogg': 'audio/ogg',
                'm4a': 'audio/mp4',
                'webm': 'audio/webm',
                'mp4': 'video/mp4',
                'mov': 'video/quicktime',
                'avi': 'video/x-msvideo'
            };
            if (mimeMap[ext]) {
                mimetype = mimeMap[ext];
                console.log(`Mimetype detected from extension: ${mimetype}`);
            }
        }

        let originalText = '';

        if (mimetype.startsWith('audio/') || mimetype.startsWith('video/')) {
            originalText = await sttService.transcribeFile(filePath, sourceLang, mimetype);
        } else if (mimetype === 'application/pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer);
            originalText = data.text;
            
            if (!originalText || originalText.trim().length < 20) {
                console.log('PDF-parse failed or extracted very little text, falling back to Gemini OCR...');
                originalText = await qaService.extractTextFromPDF(filePath);
            }
        } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ path: filePath });
            originalText = result.value;
        } else if (mimetype === 'text/plain' || mimetype === 'text/html') {
            originalText = fs.readFileSync(filePath, 'utf8');
        } else {
            return res.status(400).json({ error: `Unsupported file type: ${mimetype}` });
        }

        if (!originalText || originalText.trim() === '') {
            let errorMsg = 'Failed to extract text from file or file is empty';
            if (mimetype.startsWith('audio/') || mimetype.startsWith('video/')) {
                errorMsg = 'No speech detected in audio/video file. Please ensure the file contains clear speech.';
            }
            return res.status(500).json({ error: errorMsg });
        }

        console.log('Text extracted, starting translation...');
        const translatedText = await translationService.translate(originalText, sourceLang, targetLang);
        
        console.log('Running fact check...');
        const factCheckResult = await factCheckService.checkStatement(originalText);

        res.json({ originalText, translatedText, factCheckResult });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: error.message || 'Internal server error processing file' });
    } finally {
        // Keep files for debugging if an error occurred
        // if (filePath) {
        //     try { fs.unlinkSync(filePath); } catch (e) { 
        //         console.error('Failed to unlink file:', e.message);
        //     }
        // }
    }
});

// Q&A Feature Routes
const documentContexts = new Map();

app.post('/api/qa/upload', upload.single('file'), async (req, res) => {
    const filePath = req.file ? req.file.path : null;
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        let mimetype = req.file.mimetype;
        const originalName = req.file.originalname;

        if (mimetype === 'application/octet-stream' || !mimetype) {
            const ext = originalName.split('.').pop().toLowerCase();
            const mimeMap = {
                'pdf': 'application/pdf',
                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'txt': 'text/plain',
            };
            if (mimeMap[ext]) mimetype = mimeMap[ext];
        }

        let extractedText = '';
        const ext = originalName.split('.').pop().toLowerCase();

        if (mimetype.includes('pdf') || ext === 'pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer);
            extractedText = data.text;
            
            if (!extractedText || extractedText.trim().length < 20) {
                console.log('PDF-parse failed or extracted very little text, falling back to Gemini OCR...');
                extractedText = await qaService.extractTextFromPDF(filePath);
            }
        } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ path: filePath });
            extractedText = result.value;
        } else if (mimetype === 'text/plain' || mimetype === 'text/csv') {
            extractedText = fs.readFileSync(filePath, 'utf8');
        } else {
            return res.status(400).json({ error: `Unsupported file type for Q&A: ${mimetype}` });
        }

        if (!extractedText || extractedText.trim() === '') {
            return res.status(500).json({ error: 'Failed to extract text from file or file is empty' });
        }

        const documentId = Date.now().toString() + Math.random().toString(36).substring(7);
        documentContexts.set(documentId, extractedText);

        // Automatically generate initial questions
        const initialQuestions = await qaService.generateResumeQuestions(extractedText);

        res.json({ 
            documentId, 
            message: 'Document processed successfully.',
            initialQuestions
        });
    } catch (error) {
        console.error('Q&A Upload Error:', error);
        res.status(500).json({ error: error.message || 'Internal server error processing file' });
    } finally {
        if (filePath) {
            try { fs.unlinkSync(filePath); } catch (e) { console.error('Failed to unlink file:', e.message); }
        }
    }
});

app.post('/api/qa/transcribe', upload.single('audio'), async (req, res) => {
    const filePath = req.file ? req.file.path : null;
    const language = req.body.language || 'auto';
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file uploaded' });
        }

        const mimetype = req.file.mimetype || 'audio/webm';
        console.log(`Transcribing QA audio: ${req.file.originalname} (${mimetype}), language: ${language}`);

        const transcript = await sttService.transcribeFile(filePath, language, mimetype);
        
        if (!transcript) {
            return res.status(400).json({ error: 'Could not transcribe audio' });
        }

        res.json({ text: transcript });
    } catch (error) {
        console.error('Q&A Transcribe Error:', error);
        res.status(500).json({ error: 'Failed to transcribe audio' });
    } finally {
        if (filePath) {
            try { fs.unlinkSync(filePath); } catch (e) { console.error('Failed to unlink audio file:', e.message); }
        }
    }
});

app.post('/api/qa/ask', async (req, res) => {
    try {
        const { documentId, question, language } = req.body;

        if (!documentId || !question) {
            return res.status(400).json({ error: 'Missing documentId or question' });
        }

        const contextText = documentContexts.get(documentId);
        if (!contextText) {
            return res.status(404).json({ error: 'Document context not found or expired. Please upload again.' });
        }

        const answer = await qaService.answerQuestion(contextText, question, language || 'en');
        res.json({ answer });
    } catch (error) {
        console.error('Q&A Ask Error:', error);
        res.status(500).json({ error: 'Failed to generate answer' });
    }
});

app.post('/api/qa/speak', async (req, res) => {
    try {
        const { text, language } = req.body;
        if (!text) return res.status(400).json({ error: 'Text is required' });

        // Auto uses 'en' for speaking by default if not specified or we can let translate handle it.
        const targetLang = language && language !== 'auto' ? language : 'en';

        // Split text into chunks of max 190 characters (Google Translate TTS limit is 200)
        const words = text.split(' ');
        const chunks = [];
        let currentChunk = '';
        
        for (const word of words) {
            if ((currentChunk + ' ' + word).length <= 190) {
                currentChunk += (currentChunk ? ' ' : '') + word;
            } else {
                if (currentChunk) chunks.push(currentChunk);
                currentChunk = word;
            }
        }
        if (currentChunk) chunks.push(currentChunk);

        const audioBuffers = [];
        for (const chunk of chunks) {
            // google-translate-api-x speak() returns a base64 encoded string
            const base64Audio = await translate.speak(chunk, { to: targetLang });
            audioBuffers.push(Buffer.from(base64Audio, 'base64'));
        }
        
        const finalBuffer = Buffer.concat(audioBuffers);

        res.set('Content-Type', 'audio/mpeg');
        res.send(finalBuffer);
    } catch (error) {
        console.error('TTS Error:', error);
        res.status(500).json({ error: 'Failed to generate audio' });
    }
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/translator';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Socket.IO Handling
const activeConnections = new Map(); // socketId -> dgConnection

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('start-stream', async ({ roomId, sourceLang, targetLang }) => {
        console.log(`Starting stream for room ${roomId}`);

        const dgConnection = await sttService.startStreaming(sourceLang, async (text, isFinal) => {
            // Emit transcript to the room
            socket.emit('transcript-update', { text, isFinal, type: 'source' });

            if (isFinal) {
                // Translate
                const translated = await translationService.translate(text, sourceLang, targetLang);
                socket.emit('transcript-update', { text: translated, isFinal: true, type: 'translated' });

                // Run fact-checking asynchronously
                factCheckService.checkStatement(text).then(factCheck => {
                    if (factCheck) {
                        socket.emit('fact-check-update', { text, factCheck, type: 'source' });
                        socket.emit('fact-check-update', { text: translated, factCheck, type: 'translated' });
                    }
                }).catch(err => console.error('Fact check error:', err));

                // Save to DB
                try {
                    await Transcript.create({
                        sessionId: roomId,
                        originalText: text,
                        translatedText: translated,
                        sourceLanguage: sourceLang,
                        targetLanguage: targetLang
                    });
                } catch (err) {
                    console.error('Failed to save transcript:', err);
                }
            }
        });

        if (dgConnection) {
            activeConnections.set(socket.id, dgConnection);
        }
    });

    socket.on('audio-chunk', (data) => {
        const dgConnection = activeConnections.get(socket.id);
        if (dgConnection) {
            if (dgConnection.getReadyState() === 1) {
                dgConnection.send(data);
            } else if (dgConnection.getReadyState() === 0) {
                if (!dgConnection.chunkBuffer) dgConnection.chunkBuffer = [];
                dgConnection.chunkBuffer.push(data);
            }
        }
    });

    socket.on('stop-stream', () => {
        const dgConnection = activeConnections.get(socket.id);
        if (dgConnection) {
            dgConnection.finish();
            activeConnections.delete(socket.id);
        }
    });

    socket.on('disconnect', () => {
        const dgConnection = activeConnections.get(socket.id);
        if (dgConnection) {
            dgConnection.finish();
            activeConnections.delete(socket.id);
        }
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
