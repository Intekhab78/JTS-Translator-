import { useState, useEffect, useRef, useCallback } from 'react';
import { socketService } from '../services/socketService';

export const useHybridAI = (mode: 'cloud' | 'local') => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        if (mode === 'local' && !workerRef.current) {
            const worker = new Worker(new URL('../worker.js', import.meta.url), { type: 'module' });
            
            worker.onmessage = (e) => {
                const { status, message, type: _type, text: _text } = e.data;
                if (status) {
                    setStatus(status);
                    if (message) setMessage(message);
                }
                // Handle results later via events or callbacks
            };

            worker.postMessage({ type: 'init' });
            workerRef.current = worker;
        }
    }, [mode]);

    const processAudio = useCallback((blob: Blob, _sourceLang: string, _targetLang: string) => {
        if (mode === 'cloud') {
            socketService.sendAudioChunk(blob);
        } else if (mode === 'local' && workerRef.current) {
            // Local processing logic
            // Converting blob to Float32Array would go here
            // workerRef.current.postMessage({ type: 'transcribe', data: { audio: ... } });
        }
    }, [mode]);

    return {
        status,
        message,
        processAudio
    };
};
