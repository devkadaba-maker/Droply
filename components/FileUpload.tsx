"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { ImageKitContext, IKUpload } from "imagekitio-next";
import { Progress } from "@heroui/progress";
import { AlertCircle, CheckCircle, UploadCloud } from "lucide-react";

interface FileUploadProps {
  parentId: string | null;
  onUploadComplete: () => void;
}

export default function FileUpload({ parentId, onUploadComplete }: FileUploadProps) {
  const { userId } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);

  const onUploadStart = () => {
    setError(null);
    setSuccess(false);
    setProgress(0);
  };

  const onUploadProgress = (progress: { loaded: number; total: number }) => {
    const percentage = Math.round((progress.loaded / progress.total) * 100);
    setProgress(percentage);
  };

  const onUploadError = (err: any) => {
    setError(err.message || "Upload failed. Please try again.");
    setProgress(0);
  };

  const onUploadSuccess = () => {
    setSuccess(true);
    setProgress(100);
    onUploadComplete();
  };

  const authenticator = async () => {
    try {
        const response = await fetch('/api/imagekit-auth');
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Authentication request failed with status: ${response.status}. ${errorText}`);
        }
        return await response.json();
    } catch (error: any) {
        console.error("Authentication error:", error.message);
        // We need to re-throw the error so ImageKit's onError handler can catch it.
        throw new Error("Could not authenticate with the server.");
    }
  };

  return (
    <ImageKitContext
      value={{
        publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
        urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
        authenticator,
      }}
    >
      <div className="relative bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
        <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
        <p className="mt-2 font-semibold text-slate-700">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-slate-500 mt-1">
          PDF, JPG, PNG, etc. (up to 50MB)
        </p>
        
        <IKUpload
          folder={parentId ? `/droply/${userId}/folder/${parentId}` : `/droply/${userId}`}
          useUniqueFileName={true}
          onUploadStart={onUploadStart}
          onUploadProgress={onUploadProgress}
          onError={onUploadError}
          onSuccess={onUploadSuccess}
          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
        />

        {progress > 0 && !success && !error && (
            <Progress value={progress} className="mt-4" />
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
    </ImageKitContext>
  );
}