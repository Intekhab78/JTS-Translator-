import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
    socket = io(SOCKET_URL);

    joinRoom(roomId: string) {
        this.socket.emit('join-room', roomId);
    }

    startStream(roomId: string, sourceLang: string, targetLang: string) {
        this.socket.emit('start-stream', { roomId, sourceLang, targetLang });
    }

    sendAudioChunk(chunk: Blob) {
        this.socket.emit('audio-chunk', chunk);
    }

    onTranscript(callback: (data: any) => void) {
        this.socket.off('transcript-update');
        this.socket.on('transcript-update', callback);
    }

    offTranscript(callback: (data: any) => void) {
        this.socket.off('transcript-update', callback);
    }

    onFactCheck(callback: (data: any) => void) {
        this.socket.off('fact-check-update');
        this.socket.on('fact-check-update', callback);
    }

    offFactCheck(callback: (data: any) => void) {
        this.socket.off('fact-check-update', callback);
    }

    stopStream() {
        this.socket.emit('stop-stream');
    }
}

export const socketService = new SocketService();
