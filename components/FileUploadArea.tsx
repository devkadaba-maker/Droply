"use client";

import { useState, useCallback } from 'react';
import { Upload, X, File, Image, Video, FileText, Archive, Music } from 'lucide-react';

interface FileUploadAreaProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: () => void;
  parentId?: string | null;
}

interface UploadFile extends File {
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export default function FileUploadArea({ isOpen, onClose, onUploadComplete, parentId }: FileUploadAreaProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image size={20} className="text-blue-500" />;
    if (fileType.startsWith('video/')) return <Video size={20} className="text-red-500" />;
    if (fileType.startsWith('audio/')) return <Music size={20} className="text-green-500" />;
    if (fileType.includes('pdf') || fileType.includes('document')) return <FileText size={20} className="text-red-600" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <Archive size={20} className="text-gray-600" />;
    return <File size={20} className="text-gray-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
  };

  const addFiles = (fileList: FileList) => {
    const newFiles: UploadFile[] = Array.from(fileList).map(file => ({
      ...file,
      id: `${Date.now()}-${Math.random()}`,
      progress: 0,
      status: 'pending' as const
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const uploadFile = async (file: UploadFile): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    if (parentId) {
      formData.append('parentId', parentId);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      setFiles(prev => prev.map(f =>
        f.id === file.id
          ? { ...f, status: 'completed' as const, progress: 100 }
          : f
      ));

    } catch (error) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(f =>
        f.id === file.id
          ? { ...f, status: 'error' as const, error: 'Upload failed' }
          : f
      ));
    }
  };

  const uploadAllFiles = async () => {
    setIsUploading(true);

    const pendingFiles = files.filter(f => f.status === 'pending');
    setFiles(prev => prev.map(f =>
      f.status === 'pending'
        ? { ...f, status: 'uploading' as const }
        : f
    ));

    // Upload files sequentially to avoid overwhelming the server
    for (const file of pendingFiles) {
      await uploadFile(file);
    }

    setIsUploading(false);

    // Check if all files completed successfully
    const hasErrors = files.some(f => f.status === 'error');
    if (!hasErrors) {
      onUploadComplete?.();
      setTimeout(() => {
        onClose();
        setFiles([]);
      }, 1500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Upload Files</h2>
            <p className="text-sm text-gray-500 mt-1">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Upload Area */}
        {files.length === 0 && (
          <div
            className={`m-6 border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Drop files here to upload
            </h3>
            <p className="text-gray-500 mb-4">
              or click to browse files
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload-area"
            />
            <label
              htmlFor="file-upload-area"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
            >
              Choose Files
            </label>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-3">
              {files.map((file) => (
                <div key={file.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    {file.status === 'error' && file.error && (
                      <p className="text-xs text-red-500 mt-1">{file.error}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {file.status === 'uploading' && (
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    )}
                    {file.status === 'completed' && (
                      <span className="text-green-600 text-sm font-medium">✓</span>
                    )}
                    {file.status === 'error' && (
                      <span className="text-red-600 text-sm font-medium">✕</span>
                    )}
                    {(file.status === 'pending' || file.status === 'error') && (
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <X size={16} className="text-gray-500" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        {files.length > 0 && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              {files.filter(f => f.status === 'completed').length} of {files.length} completed
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setFiles([])}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={uploadAllFiles}
                disabled={isUploading || files.every(f => f.status === 'completed')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? 'Uploading...' : 'Upload All'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
