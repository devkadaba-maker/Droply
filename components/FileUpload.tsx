// in components/FileUpload.tsx

"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Progress } from "@nextui-org/react";
import { AlertCircle, CheckCircle, UploadCloud } from "lucide-react";

interface FileUploadProps {
  parentId: string | null;
  onUploadComplete: () => void;
}

export default function FileUpload({ parentId, onUploadComplete }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);

  console.log('FileUpload component rendered with parentId:', parentId);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Reset state for the new upload
    setError(null);
    setSuccess(false);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    if (parentId) {
      formData.append("parentId", parentId);
    }

    try {
      const xhr = new XMLHttpRequest();
      // This now points to YOUR backend API endpoint
      xhr.open("POST", "/api/upload", true);

      // Listen to progress events
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          setProgress(percentage);
        }
      };

      // Handle completion
      xhr.onload = () => {
        if (xhr.status === 201) { // Check for the "Created" status from your API
          setSuccess(true);
          onUploadComplete();
        } else {
          try {
            const response = JSON.parse(xhr.responseText);
            setError(response.error || "Upload failed. Please try again.");
          } catch (e) {
            setError("Upload failed. Please try again.");
          }
        }
      };

      // Handle network errors
      xhr.onerror = () => {
        setError("An unknown network error occurred during upload.");
      };

      xhr.send(formData);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    }
  }, [parentId, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  console.log('FileUpload component rendering with isDragActive:', isDragActive);

  return (
    <div
      {...getRootProps()}
      className={`relative border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer transition-colors ${
        isDragActive ? 'bg-blue-100' : 'bg-slate-100'
      }`}
      onClick={() => console.log('FileUpload div clicked')}
    >
      <input {...getInputProps()} />
      <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
      <p className="mt-2 font-semibold text-slate-700">
        {isDragActive ? 'Drop the file here ...' : 'Click to upload or drag and drop'}
      </p>
      <p className="mt-2 text-xs text-gray-500">Click anywhere in this area to select a file</p>
      
      {progress > 0 && !success && !error && (
        <div className="mt-4">
          <Progress value={progress} />
        </div>
      )}
      
      {success && (
        <div className="mt-4 text-green-600 flex items-center justify-center gap-2">
          <CheckCircle size={20} />
          <span>Upload successful!</span>
        </div>
      )}

      {error && (
         <div className="mt-4 text-red-600 flex items-center justify-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}