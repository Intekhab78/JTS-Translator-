import { io, Socket } from 'socket.io-client';
import { getBaseUrl } from '../config/api';

class SocketService {
    private _socket: Socket | null = null;

    private get socket(): Socket {
        if (!this._socket) {
            this._socket = io(getBaseUrl());
        }
        return this._socket;
    }

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
