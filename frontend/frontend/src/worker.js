import { pipeline, env } from '@huggingface/transformers';

// Skip local checks for models since we're in a browser environment
env.allowLocalModels = false;

class LocalAIWorker {
    static instance = null;
    sttPipeline = null;
    translationPipeline = null;

    static getInstance() {
        if (!LocalAIWorker.instance) {
            LocalAIWorker.instance = new LocalAIWorker();
        }
        return LocalAIWorker.instance;
    }

    async init() {
        self.postMessage({ status: 'loading', message: 'Initializing Whisper (STT)...' });
        this.sttPipeline = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
            device: 'webgpu', // Try WebGPU first
        });

        self.postMessage({ status: 'loading', message: 'Initializing M2M100 (Translation)...' });
        this.translationPipeline = await pipeline('translation', 'Xenova/m2m100_418M');

        self.postMessage({ status: 'ready' });
    }

    async transcribe(audio) {
        const output = await this.sttPipeline(audio, {
            chunk_length_s: 30,
            stride_length_s: 5,
        });
        return output.text;
    }

    async translate(text, src_lang, tgt_lang) {
        const output = await this.translationPipeline(text, {
            src_lang,
            tgt_lang,
        });
        return output[0].translation_text;
    }
}

const worker = LocalAIWorker.getInstance();

self.onmessage = async (e) => {
    const { type, data } = e.data;

    try {
        if (type === 'init') {
            await worker.init();
        } else if (type === 'transcribe') {
            const text = await worker.transcribe(data.audio);
            self.postMessage({ type: 'transcript', text, isFinal: true });
        } else if (type === 'translate') {
            const translation = await worker.translate(data.text, data.src_lang, data.tgt_lang);
            self.postMessage({ type: 'translation', text: translation });
        }
    } catch (error) {
        self.postMessage({ status: 'error', message: error.message });
    }
};
