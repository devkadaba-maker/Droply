"use client"

import { useState, useCallback, useRef } from 'react'
import { Card, CardBody } from "@heroui/card"
import { Button } from "@heroui/button"
import { Progress } from "@heroui/progress"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal"
import { Upload, X, File, Image, Video, Music, FileText } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

interface UploadFile {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
}

interface FileUploadProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete: () => void
  currentFolder: string | null
}

export default function FileUpload({ isOpen, onClose, onUploadComplete, currentFolder }: FileUploadProps) {
  const { user } = useUser()
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-6 w-6 text-blue-500" />
    if (fileType.startsWith('video/')) return <Video className="h-6 w-6 text-purple-500" />
    if (fileType.startsWith('audio/')) return <Music className="h-6 w-6 text-green-500" />
    if (fileType.includes('pdf') || fileType.includes('document')) return <FileText className="h-6 w-6 text-red-500" />
    return <File className="h-6 w-6 text-gray-500" />
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return

    const newFiles: UploadFile[] = Array.from(files).map(file => ({
      id: `${Date.now()}-${file.name}`,
      file,
      progress: 0,
      status: 'pending'
    }))

    setUploadFiles(prev => [...prev, ...newFiles])
  }, [])

  // Handle drag events
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
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  // Remove file from upload list
  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId))
  }

  // Upload single file
  const uploadFile = async (uploadFile: UploadFile): Promise<void> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('file', uploadFile.file)
      formData.append('userId', user?.id || '')
      if (currentFolder) {
        formData.append('parentId', currentFolder)
      }

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setUploadFiles(prev => prev.map(f =>
            f.id === uploadFile.id ? { ...f, progress } : f
          ))
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadFiles(prev => prev.map(f =>
            f.id === uploadFile.id ? { ...f, status: 'completed', progress: 100 } : f
          ))
          resolve()
        } else {
          setUploadFiles(prev => prev.map(f =>
            f.id === uploadFile.id ? { ...f, status: 'error', error: 'Upload failed' } : f
          ))
          reject(new Error('Upload failed'))
        }
      })

      xhr.addEventListener('error', () => {
        setUploadFiles(prev => prev.map(f =>
          f.id === uploadFile.id ? { ...f, status: 'error', error: 'Network error' } : f
        ))
        reject(new Error('Network error'))
      })

      xhr.open('POST', '/api/files/upload')
      xhr.send(formData)
    })
  }

  // Start all uploads
  const startUploads = async () => {
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending')

    for (const file of pendingFiles) {
      setUploadFiles(prev => prev.map(f =>
        f.id === file.id ? { ...f, status: 'uploading' } : f
      ))

      try {
        await uploadFile(file)
      } catch (error) {
        console.error('Upload error:', error)
      }
    }

    // Check if all uploads are complete
    const allComplete = uploadFiles.every(f => f.status === 'completed' || f.status === 'error')
    if (allComplete) {
      onUploadComplete()
    }
  }

  // Clear completed uploads
  const clearCompleted = () => {
    setUploadFiles(prev => prev.filter(f => f.status !== 'completed'))
  }

  // Reset and close
  const handleClose = () => {
    setUploadFiles([])
    onClose()
  }

  const totalFiles = uploadFiles.length
  const completedFiles = uploadFiles.filter(f => f.status === 'completed').length
  const hasErrors = uploadFiles.some(f => f.status === 'error')

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl">
      <ModalContent>
        <ModalHeader className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Upload Files</h2>
          <Button isIconOnly variant="light" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </ModalHeader>

        <ModalBody>
          {/* Drop zone */}
          <Card
            className={`border-2 border-dashed transition-colors cursor-pointer ${
              isDragOver ? 'border-primary bg-primary/5' : 'border-default-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <CardBody className="flex flex-col items-center justify-center py-12">
              <Upload className="h-12 w-12 text-default-400 mb-4" />
              <p className="text-lg font-medium text-default-700 mb-2">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-default-500">
                Support for images, videos, documents, and more
              </p>
            </CardBody>
          </Card>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />

          {/* Upload list */}
          {uploadFiles.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">
                  Files ({completedFiles}/{totalFiles})
                </h3>
                <div className="flex space-x-2">
                  <Button size="sm" variant="light" onClick={clearCompleted}>
                    Clear Completed
                  </Button>
                  <Button size="sm" variant="light" onClick={() => setUploadFiles([])}>
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {uploadFiles.map((uploadFile) => (
                  <Card key={uploadFile.id} className="border border-default-200">
                    <CardBody className="p-3">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(uploadFile.file.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                          <p className="text-xs text-default-500">
                            {formatFileSize(uploadFile.file.size)}
                          </p>
                          {uploadFile.status === 'uploading' && (
                            <Progress
                              value={uploadFile.progress}
                              className="mt-2"
                              size="sm"
                              color="primary"
                            />
                          )}
                          {uploadFile.error && (
                            <p className="text-xs text-danger mt-1">{uploadFile.error}</p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          {uploadFile.status === 'completed' && (
                            <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                          )}
                          {uploadFile.status === 'error' && (
                            <div className="w-6 h-6 bg-danger rounded-full flex items-center justify-center">
                              <X className="h-3 w-3 text-white" />
                            </div>
                          )}
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onClick={() => removeFile(uploadFile.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={startUploads}
            isDisabled={uploadFiles.length === 0 || uploadFiles.every(f => f.status === 'completed')}
          >
            {uploadFiles.some(f => f.status === 'uploading') ? 'Uploading...' : 'Start Upload'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
