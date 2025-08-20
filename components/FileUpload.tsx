"use client"

import { useState, useRef, useCallback } from "react"
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter 
} from "@heroui/modal"
import { Button } from "@heroui/button"
import { Progress } from "@heroui/progress"
import { 
  Upload, 
  File, 
  X, 
  Check,
  AlertCircle 
} from "lucide-react"
import { useUser } from "@clerk/nextjs"

interface FileUploadProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete: () => void
  currentFolder: string | null
}

interface UploadFile {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
}

export default function FileUpload({ 
  isOpen, 
  onClose, 
  onUploadComplete, 
  currentFolder 
}: FileUploadProps) {
  const { user } = useUser()
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback((files: FileList) => {
    const newFiles: UploadFile[] = Array.from(files).map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }))
    
    setUploadFiles(prev => [...prev, ...newFiles])
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles])

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles])

  const removeFile = useCallback((index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  const uploadFile = async (fileData: UploadFile, index: number) => {
    if (!user) return

    setUploadFiles(prev => prev.map((f, i) => 
      i === index ? { ...f, status: 'uploading' } : f
    ))

    try {
      const formData = new FormData()
      formData.append('file', fileData.file)
      formData.append('userId', user.id)
      if (currentFolder) {
        formData.append('parentId', currentFolder)
      }

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      setUploadFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'completed', progress: 100 } : f
      ))
    } catch (error) {
      setUploadFiles(prev => prev.map((f, i) => 
        i === index ? { 
          ...f, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Upload failed' 
        } : f
      ))
    }
  }

  const uploadAllFiles = async () => {
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending')
    
    for (let i = 0; i < uploadFiles.length; i++) {
      if (uploadFiles[i].status === 'pending') {
        await uploadFile(uploadFiles[i], i)
      }
    }
    
    // Check if all files are completed
    const allCompleted = uploadFiles.every(f => f.status === 'completed')
    if (allCompleted) {
      onUploadComplete()
      setTimeout(() => {
        onClose()
        setUploadFiles([])
      }, 1000)
    }
  }

  const handleClose = () => {
    setUploadFiles([])
    onClose()
  }

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <File className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: UploadFile['status']) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'error':
        return 'danger'
      case 'uploading':
        return 'primary'
      default:
        return 'default'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl">
      <ModalContent>
        <ModalHeader>
          <h3 className="text-lg font-semibold">Upload Files</h3>
        </ModalHeader>
        
        <ModalBody>
          {/* Drop Zone */}
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${isDragOver 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Drop files here or click to browse
            </h4>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Support for all file types up to 10MB each
            </p>
            <Button 
              color="primary"
              onClick={handleFileSelect}
            >
              Browse Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileInputChange}
            />
          </div>

          {/* File List */}
          {uploadFiles.length > 0 && (
            <div className="mt-6 space-y-3 max-h-60 overflow-y-auto">
              {uploadFiles.map((uploadFile, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  {getStatusIcon(uploadFile.status)}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {uploadFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    
                    {uploadFile.status === 'uploading' && (
                      <Progress
                        value={uploadFile.progress}
                        color="primary"
                        size="sm"
                        className="mt-2"
                      />
                    )}
                    
                    {uploadFile.status === 'error' && uploadFile.error && (
                      <p className="text-xs text-red-500 mt-1">{uploadFile.error}</p>
                    )}
                  </div>

                  {uploadFile.status === 'pending' && (
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={uploadAllFiles}
            isDisabled={uploadFiles.length === 0 || uploadFiles.every(f => f.status !== 'pending')}
            isLoading={uploadFiles.some(f => f.status === 'uploading')}
          >
            {uploadFiles.some(f => f.status === 'uploading') ? 'Uploading...' : 'Upload Files'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
