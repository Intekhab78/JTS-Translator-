import React, { useEffect, useRef } from 'react';

interface WaveformProps {
    isRecording: boolean;
}

export const Waveform: React.FC<WaveformProps> = ({ isRecording }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationRef = useRef<number>(undefined);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        if (isRecording) {
            const startVisualization = async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    streamRef.current = stream;
                    const audioContext = new AudioContext();
                    const source = audioContext.createMediaStreamSource(stream);
                    const analyser = audioContext.createAnalyser();
                    
                    analyser.fftSize = 256;
                    source.connect(analyser);
                    
                    audioContextRef.current = audioContext;
                    analyserRef.current = analyser;
                    
                    draw();
                } catch (e) {
                    console.error('Error in Waveform visualization setup:', e);
                }
            };
            
            startVisualization();
        } else {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
            if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
        }

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
            if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
        };
    }, [isRecording]);

    const draw = () => {
        const canvas = canvasRef.current;
        const analyser = analyserRef.current;
        if (!canvas || !analyser) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // Gradient only needs to be created once per canvas setup
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#4f46e5');
        gradient.addColorStop(1, '#ec4899');
        ctx.fillStyle = gradient;

        const renderFrame = () => {
            animationRef.current = requestAnimationFrame(renderFrame);
            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2;

                ctx.beginPath(); // THIS IS CRITICAL TO PREVENT MEMORY AND CPU LEAK
                ctx.roundRect(x, (canvas.height - barHeight) / 2, barWidth, barHeight, 5);
                ctx.fill();

                x += barWidth + 2;
            }
        };

        renderFrame();
    };

    return (
        <canvas 
            ref={canvasRef} 
            className="w-full h-full"
            width={800}
            height={100}
        />
    );
};
