"use client"

import { useState } from "react"
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter 
} from "@heroui/modal"
import { Button } from "@heroui/button"
import { 
  Download, 
  X,
  File,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Archive
} from "lucide-react"
import { formatBytes, getFileExtension, isImageFile, isVideoFile, isAudioFile } from "@/lib/utils"

interface FileItem {
  id: string
  name: string
  type: string
  size: number
  isFolder: boolean
  isStarred: boolean
  isTrash: boolean
  fileUrl?: string
  thumbnailUrl?: string
  updatedAt: string
  parentId: string | null
  userId: string
}

interface FilePreviewModalProps {
  file: FileItem | null
  isOpen: boolean
  onClose: () => void
  onDownload: (file: FileItem) => void
}

export default function FilePreviewModal({ 
  file, 
  isOpen, 
  onClose, 
  onDownload 
}: FilePreviewModalProps) {
  const [imageError, setImageError] = useState(false)

  if (!file) return null

  const extension = getFileExtension(file.name)
  const isImage = isImageFile(file.name)
  const isVideo = isVideoFile(file.name)
  const isAudio = isAudioFile(file.name)

  const getFileIcon = () => {
    if (isImage) return <ImageIcon className="h-16 w-16 text-green-500" />
    if (isVideo) return <Video className="h-16 w-16 text-purple-500" />
    if (isAudio) return <Music className="h-16 w-16 text-pink-500" />
    if (['zip', 'rar', '7z'].includes(extension)) return <Archive className="h-16 w-16 text-orange-500" />
    if (['txt', 'doc', 'docx', 'pdf'].includes(extension)) return <FileText className="h-16 w-16 text-red-500" />
    return <File className="h-16 w-16 text-gray-500" />
  }

  const renderPreview = () => {
    if (!file.fileUrl) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          {getFileIcon()}
          <p className="text-gray-500 mt-4">No preview available</p>
        </div>
      )
    }

    if (isImage && !imageError) {
      return (
        <div className="flex justify-center">
          <img
            src={file.fileUrl}
            alt={file.name}
            className="max-h-96 max-w-full object-contain rounded-lg"
            onError={() => setImageError(true)}
          />
        </div>
      )
    }

    if (isVideo) {
      return (
        <div className="flex justify-center">
          <video
            controls
            className="max-h-96 max-w-full rounded-lg"
            preload="metadata"
          >
            <source src={file.fileUrl} type={`video/${extension}`} />
            Your browser does not support the video tag.
          </video>
        </div>
      )
    }

    if (isAudio) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Music className="h-16 w-16 text-pink-500 mb-4" />
          <audio controls className="w-full max-w-md">
            <source src={file.fileUrl} type={`audio/${extension}`} />
            Your browser does not support the audio tag.
          </audio>
        </div>
      )
    }

    if (extension === 'pdf') {
      return (
        <div className="h-96">
          <iframe
            src={file.fileUrl}
            className="w-full h-full rounded-lg border"
            title={file.name}
          />
        </div>
      )
    }

    if (['txt', 'md', 'json', 'js', 'ts', 'css', 'html'].includes(extension)) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="h-16 w-16 text-red-500 mb-4" />
          <p className="text-gray-500">Text file preview not available</p>
          <Button
            color="primary"
            variant="bordered"
            className="mt-4"
            onClick={() => window.open(file.fileUrl, '_blank')}
          >
            Open in New Tab
          </Button>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center py-12">
        {getFileIcon()}
        <p className="text-gray-500 mt-4">Preview not available for this file type</p>
      </div>
    )
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate">{file.name}</h3>
            <p className="text-sm text-gray-500">
              {formatBytes(file.size)} • {extension.toUpperCase()}
            </p>
          </div>
        </ModalHeader>
        
        <ModalBody className="pb-6">
          {renderPreview()}
          
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">File name:</span>
                <p className="text-gray-900 dark:text-white truncate">{file.name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Size:</span>
                <p className="text-gray-900 dark:text-white">{formatBytes(file.size)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
                <p className="text-gray-900 dark:text-white">{file.type || extension.toUpperCase()}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Modified:</span>
                <p className="text-gray-900 dark:text-white">
                  {new Date(file.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onClick={onClose}>
            Close
          </Button>
          <Button
            color="primary"
            startContent={<Download className="h-4 w-4" />}
            onClick={() => onDownload(file)}
          >
            Download
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
