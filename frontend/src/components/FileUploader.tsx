import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileAudio, FileVideo, FileText, Loader2 } from 'lucide-react';

interface FileUploaderProps {
    sourceLang: string;
    targetLang: string;
    onUploadComplete: (originalText: string, translatedText: string, factCheckResult?: any) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ sourceLang, targetLang, onUploadComplete }) => {
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;
        
        setIsUploading(true);
        const file = acceptedFiles[0]; 

        const formData = new FormData();
        formData.append('file', file);
        formData.append('sourceLang', sourceLang);
        formData.append('targetLang', targetLang);

        try {
            const response = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await response.json();
            onUploadComplete(data.originalText, data.translatedText, data.factCheckResult);
        } catch (error: any) {
            console.error('File upload failed:', error);
            alert(`File processing failed: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    }, [sourceLang, targetLang, onUploadComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        disabled: isUploading,
        accept: {
            'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'],
            'video/*': ['.mp4', '.mov', '.avi'],
            'text/plain': ['.txt'],
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        }
    });

    return (
        <div 
            {...getRootProps()} 
            className={`cursor-pointer transition-all border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 ${
                isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-600 bg-slate-900/30'
            } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
            <input {...getInputProps()} />
            <div className="p-3 bg-slate-800 rounded-xl">
                {isUploading ? (
                    <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                ) : (
                    <Upload className="w-6 h-6 text-indigo-400" />
                )}
            </div>
            <div className="text-center">
                <p className="text-sm font-semibold text-slate-300">
                    {isUploading ? 'Processing File...' : (isDragActive ? 'Drop your files here' : 'Click or drag files to translate')}
                </p>
                {!isUploading && <p className="text-xs text-slate-500 mt-1">Audio, Video, PDF, DOCX, or TXT</p>}
            </div>
            {!isUploading && (
                <div className="flex gap-4 mt-2">
                    <FileAudio className="w-4 h-4 text-slate-600" />
                    <FileVideo className="w-4 h-4 text-slate-600" />
                    <FileText className="w-4 h-4 text-slate-600" />
                </div>
            )}
        </div>
    );
};
