const { createClient } = require('@deepgram/sdk');
const fs = require('fs');

class STTService {
    constructor() {
        this.deepgram = createClient(process.env.DEEPGRAM_API_KEY);
    }

    async startStreaming(sourceLang, onTranscript) {
        if (!process.env.DEEPGRAM_API_KEY) {
            console.warn('DEEPGRAM_API_KEY is missing. STT will not work.');
            return null;
        }

        const options = {
            interim_results: true,
            smart_format: true,
        };

        if (sourceLang === 'auto') {
            options.language = 'multi';
            options.model = 'nova-3';
            options.endpointing = '100';
        } else if (sourceLang === 'ar') {
            options.model = 'nova-3';
            options.language = 'ar';
        } else {
            options.model = 'nova-2';
            options.language = sourceLang || 'en';
        }

        const { LiveTranscriptionEvents } = require('@deepgram/sdk');

        console.log('Deepgram Options:', options);
        // Revert to .live() but keep it robust
        const dgConnection = this.deepgram.listen.live(options);

        // Listen for both capitalized and lowercase events for maximum compatibility
        const handleOpen = () => {
            console.log('Deepgram connection opened (Safe Start)');
            if (dgConnection.chunkBuffer) {
                dgConnection.chunkBuffer.forEach(chunk => dgConnection.send(chunk));
                dgConnection.chunkBuffer = null;
            }
        };

        dgConnection.on(LiveTranscriptionEvents.Open, handleOpen);
        dgConnection.on('open', handleOpen);

        const handleTranscript = (data) => {
            const transcript = data.channel?.alternatives?.[0]?.transcript || '';
            if (transcript) {
                console.log('Deepgram Result:', transcript);
            }
            
            const detectedLang = data.channel?.detected_language || 
                               (data.metadata?.detected_language) ||
                               (data.channel?.alternatives?.[0]?.languages?.[0]);
                               
            if (detectedLang) {
                console.log('DETECTED LANGUAGE:', detectedLang);
            }
            
            if (transcript && data.is_final) {
                onTranscript(transcript, true, detectedLang);
            } else if (transcript) {
                onTranscript(transcript, false, detectedLang);
            }
        };

        // Use only the official v3 SDK events to avoid duplicates
        dgConnection.on(LiveTranscriptionEvents.Transcript, handleTranscript);
        dgConnection.on(LiveTranscriptionEvents.Metadata, (data) => {
            // console.log('Deepgram Metadata:', JSON.stringify(data));
        });

        const handleError = (err) => {
            console.error('Deepgram Connection Error:', err);
        };

        dgConnection.on(LiveTranscriptionEvents.Error, handleError);
        dgConnection.on('error', handleError);

        dgConnection.on(LiveTranscriptionEvents.Close, () => {
            console.log('Deepgram connection closed');
        });
        dgConnection.on('close', () => {
            console.log('Deepgram connection closed');
        });

        return dgConnection;
    }

    async transcribeFile(filePath, sourceLang, mimetype) {
        if (!process.env.DEEPGRAM_API_KEY) {
            console.warn('DEEPGRAM_API_KEY is missing. STT will not work.');
            return null;
        }

        const options = {
            smart_format: true,
            model: 'nova-2',
            punctuate: true,
            ...(sourceLang === 'auto' ? { detect_language: true } : { language: sourceLang || 'en' })
        };

        try {
            console.log(`Transcribing file: ${filePath}, Options:`, options);
            const fileBuffer = fs.readFileSync(filePath);
            
            // Debug logging to a file
            try {
                fs.appendFileSync('stt_debug.log', `\n[${new Date().toISOString()}] Upload: ${filePath}, Size: ${fileBuffer.length} bytes, Hex: ${fileBuffer.slice(0, 20).toString('hex')}`);
            } catch (e) { }
            
            // Pass the buffer directly as the first argument, as per official SDK v3 docs
            const { result, error } = await this.deepgram.listen.prerecorded.transcribeFile(
                fileBuffer,
                options
            );

            // Debug logging to a file
            try {
                fs.appendFileSync('stt_debug.log', `\n[${new Date().toISOString()}] Result for ${filePath}:\n${JSON.stringify(result, null, 2)}\n`);
            } catch (e) { }

            if (error) {
                console.error('Deepgram API Error:', error);
                throw new Error(`Deepgram Error: ${error.message || JSON.stringify(error)}`);
            }

            const transcript = result?.results?.channels[0]?.alternatives[0]?.transcript;
            
            if (!transcript) {
                console.warn('Deepgram returned empty transcript for file');
            }

            return transcript;
        } catch (err) {
            console.error('Failed to transcribe file with Deepgram:', err);
            throw err; // Re-throw to be caught by index.js
        }
    }
}

module.exports = new STTService();
