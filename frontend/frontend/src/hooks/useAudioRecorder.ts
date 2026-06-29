import { useState, useRef, useCallback, useEffect } from 'react';

export const useAudioRecorder = (onDataAvailable: (blob: Blob) => void) => {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const onDataAvailableRef = useRef(onDataAvailable);

    useEffect(() => {
        onDataAvailableRef.current = onDataAvailable;
    }, [onDataAvailable]);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0 && onDataAvailableRef.current) {
                    onDataAvailableRef.current(event.data);
                }
            };

            // Capture in 100ms chunks for low latency
            mediaRecorder.start(100);
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    }, []);

    const stopRecording = useCallback(() => {
        try {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
        } catch (error) {
            console.error('Error stopping MediaRecorder:', error);
        }

        try {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        } catch (error) {
            console.error('Error stopping stream tracks:', error);
        }
        
        mediaRecorderRef.current = null;
        streamRef.current = null;
        setIsRecording(false);
    }, []);

    const toggleRecording = useCallback(() => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }, [isRecording, startRecording, stopRecording]);

    useEffect(() => {
        return () => {
            if (isRecording) {
                stopRecording();
            }
        };
    }, [isRecording, stopRecording]);

    return {
        isRecording,
        startRecording,
        stopRecording,
        toggleRecording
    };
};
