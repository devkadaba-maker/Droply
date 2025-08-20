"use client"

import { useState } from "react"
import { 
  Card, 
  CardBody 
} from "@heroui/card"
import { 
  Button 
} from "@heroui/button"
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from "@heroui/dropdown"
import { 
  Folder, 
  File, 
  Image, 
  FileText, 
  Archive, 
  Video,
  Music,
  MoreVertical,
  Star,
  Trash2,
  Download,
  Eye
} from "lucide-react"
import { formatBytes, formatDate } from "@/lib/utils"

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

interface FileGridProps {
  files: FileItem[]
  viewMode: 'grid' | 'list'
  onFolderClick: (folder: FileItem) => void
  onFileAction: (action: string, file: FileItem) => void
}

export default function FileGrid({ 
  files, 
  viewMode, 
  onFolderClick, 
  onFileAction 
}: FileGridProps) {


  const getFileIcon = (file: FileItem) => {
    if (file.isFolder) {
      return <Folder className="h-8 w-8 text-blue-500" />
    }

    const extension = file.name.split('.').pop()?.toLowerCase()
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return <Image className="h-8 w-8 text-green-500" />
    }
    if (['mp4', 'avi', 'mkv', 'mov'].includes(extension || '')) {
      return <Video className="h-8 w-8 text-purple-500" />
    }
    if (['mp3', 'wav', 'flac'].includes(extension || '')) {
      return <Music className="h-8 w-8 text-pink-500" />
    }
    if (['zip', 'rar', '7z'].includes(extension || '')) {
      return <Archive className="h-8 w-8 text-orange-500" />
    }
    if (['txt', 'doc', 'docx', 'pdf'].includes(extension || '')) {
      return <FileText className="h-8 w-8 text-red-500" />
    }
    
    return <File className="h-8 w-8 text-gray-500" />
  }

  const handleFileClick = (file: FileItem) => {
    if (file.isFolder) {
      onFolderClick(file)
    }
  }

  const handleActionClick = (action: string, file: FileItem, e?: React.MouseEvent) => {
    e?.stopPropagation()
    onFileAction(action, file)
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Folder className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No files found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
          Upload files or create folders to get started with your cloud storage.
        </p>
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400">
          <div className="col-span-5">Name</div>
          <div className="col-span-2">Size</div>
          <div className="col-span-3">Modified</div>
          <div className="col-span-2">Actions</div>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {files.map((file) => (
            <div
              key={file.id}
              className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => handleFileClick(file)}
            >
              <div className="col-span-5 flex items-center gap-3">
                {file.thumbnailUrl && !file.isFolder ? (
                  <img
                    src={file.thumbnailUrl}
                    alt={file.name}
                    className="w-8 h-8 object-cover rounded"
                  />
                ) : (
                  getFileIcon(file)
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {file.isFolder ? 'Folder' : file.type}
                  </p>
                </div>
                {file.isStarred && (
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                )}
              </div>
              
              <div className="col-span-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                {file.isFolder ? '—' : formatBytes(file.size)}
              </div>
              
              <div className="col-span-3 flex items-center text-sm text-gray-500 dark:text-gray-400">
                {formatDate(file.updatedAt)}
              </div>
              
              <div className="col-span-2 flex items-center justify-end">
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu>
                    {[
                      ...(!file.isFolder ? [
                        <DropdownItem
                          key="preview"
                          startContent={<Eye className="h-4 w-4" />}
                          onClick={(e) => handleActionClick('preview', file, e as React.MouseEvent)}
                        >
                          Preview
                        </DropdownItem>,
                        <DropdownItem
                          key="download"
                          startContent={<Download className="h-4 w-4" />}
                          onClick={(e) => handleActionClick('download', file, e as React.MouseEvent)}
                        >
                          Download
                        </DropdownItem>
                      ] : []),
                      <DropdownItem
                        key="star"
                        startContent={<Star className="h-4 w-4" />}
                        onClick={(e) => handleActionClick('toggleStar', file, e as React.MouseEvent)}
                      >
                        {file.isStarred ? 'Unstar' : 'Star'}
                      </DropdownItem>,
                      {!file.isTrash ? (
                        <DropdownItem
                          key="trash"
                          startContent={<Trash2 className="h-4 w-4" />}
                          color="warning"
                          onClick={(e) => handleActionClick('moveToTrash', file, e as React.MouseEvent)}
                        >
                          Move to Trash
                        </DropdownItem>
                      ) : (
                        <DropdownItem
                          key="delete"
                          startContent={<Trash2 className="h-4 w-4" />}
                          color="danger"
                          onClick={(e) => handleActionClick('delete', file, e as React.MouseEvent)}
                        >
                          Delete Forever
                        </DropdownItem>
                      )}
                    ]}
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {files.map((file) => (
        <Card
          key={file.id}
          isPressable
          onPress={() => handleFileClick(file)}
          className="group hover:shadow-md transition-shadow"
        >
          <CardBody className="p-4">
            <div className="relative">
              {/* File Preview/Icon */}
              <div className="aspect-square mb-3 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
                {file.thumbnailUrl && !file.isFolder ? (
                  <img
                    src={file.thumbnailUrl}
                    alt={file.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  getFileIcon(file)
                )}
              </div>

              {/* Star indicator */}
              {file.isStarred && (
                <Star className="absolute top-2 right-2 h-4 w-4 text-yellow-400 fill-current" />
              )}

              {/* Actions */}
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      isIconOnly
                      variant="solid"
                      color="default"
                      size="sm"
                      className="bg-white/90 backdrop-blur-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu>
                    {[
                      ...(!file.isFolder ? [
                        <DropdownItem
                          key="preview"
                          startContent={<Eye className="h-4 w-4" />}
                          onClick={(e) => handleActionClick('preview', file, e as React.MouseEvent)}
                        >
                          Preview
                        </DropdownItem>,
                        <DropdownItem
                          key="download"
                          startContent={<Download className="h-4 w-4" />}
                          onClick={(e) => handleActionClick('download', file, e as React.MouseEvent)}
                        >
                          Download
                        </DropdownItem>
                      ] : []),
                      <DropdownItem
                        key="star"
                        startContent={<Star className="h-4 w-4" />}
                        onClick={(e) => handleActionClick('toggleStar', file, e as React.MouseEvent)}
                      >
                        {file.isStarred ? 'Unstar' : 'Star'}
                      </DropdownItem>,
                      {!file.isTrash ? (
                        <DropdownItem
                          key="trash"
                          startContent={<Trash2 className="h-4 w-4" />}
                          color="warning"
                          onClick={(e) => handleActionClick('moveToTrash', file, e as React.MouseEvent)}
                        >
                          Move to Trash
                        </DropdownItem>
                      ) : (
                        <DropdownItem
                          key="delete"
                          startContent={<Trash2 className="h-4 w-4" />}
                          color="danger"
                          onClick={(e) => handleActionClick('delete', file, e as React.MouseEvent)}
                        >
                          Delete Forever
                        </DropdownItem>
                      )}
                    ]}
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>

            {/* File Info */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {file.name}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{file.isFolder ? 'Folder' : formatBytes(file.size)}</span>
                <span>{formatDate(file.updatedAt)}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  )
}
