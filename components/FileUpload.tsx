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
  const [uploadingFileName, setUploadingFileName] = useState("");

  const onUploadStart = (evt: any) => {
    setUploadingFileName(evt.target.files[0].name);
    setError(null);
    setSuccess(false);
    setProgress(0);
  };

  const onUploadProgress = (progress: { loaded: number; total: number }) => {
    setProgress(Math.round((progress.loaded / progress.total) * 100));
  };

  const onUploadError = (err: any) => {
    // This will now catch any error, including from a failed authenticator
    setError(err.message || "Upload failed. Please try again.");
    setProgress(0);
  };

  const onUploadSuccess = async (res: any) => {
    try {
      const apiResponse = await fetch('/api/files/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...res, parentId }),
      });
      if (!apiResponse.ok) {
        throw new Error('Failed to save file metadata.');
      }
      setSuccess(true);
      setProgress(100);
      onUploadComplete();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const authenticator = async () => {
    try {
      const response = await fetch('/api/imagekit-auth');
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Authentication request failed: ${response.status}. ${errorText}`);
      }
      return await response.json();
    } catch (error: any) {
      // Re-throwing the error here is crucial. It ensures that the IKUpload
      // component's onError handler will be triggered if auth fails.
      throw error;
    }
  };

  if (!userId) {
    return (
      <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl p-6 text-center opacity-50">
        <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
        <p className="mt-2 font-semibold text-slate-700">Authenticating...</p>
      </div>
    );
  }

  return (
    <ImageKitContext
      value={{
        publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
        urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
        authenticator,
      }}
    >
      <div className="relative bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl p-6 text-center" suppressHydrationWarning>
        <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
        <p className="mt-2 font-semibold text-slate-700">
          Click to upload or drag and drop
        </p>
        
        <IKUpload
          fileName={uploadingFileName}
          // --- THIS IS THE FINAL FIX ---
          // We simplify the folder path to a clean structure.
          folder={parentId ? `/${userId}/${parentId}` : `/${userId}`}
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