"use client"

import { Card, CardBody } from "@heroui/card"
import { Button } from "@heroui/button"
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown"
import { Folder, File, Star, Trash2, MoreVertical, Download, Share, Edit, Eye } from 'lucide-react'

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

export default function FileGrid({ files, viewMode, onFolderClick, onFileAction }: FileGridProps) {
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No files found</p>
      </div>
    )
  }

  return (
    <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4' : 'space-y-2'}>
      {files.map((file) => (
        <Card
          key={file.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => file.isFolder && onFolderClick(file)}
        >
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {file.isFolder ? (
                  <Folder className="h-8 w-8 text-blue-500" />
                ) : (
                  <File className="h-8 w-8 text-gray-500" />
                )}
                {file.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
              </div>

              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly variant="light" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem key="preview" startContent={<Eye className="h-4 w-4" />}>
                    Preview
                  </DropdownItem>
                  <DropdownItem key="download" startContent={<Download className="h-4 w-4" />}>
                    Download
                  </DropdownItem>
                  <DropdownItem key="share" startContent={<Share className="h-4 w-4" />}>
                    Share
                  </DropdownItem>
                  <DropdownItem key="rename" startContent={<Edit className="h-4 w-4" />}>
                    Rename
                  </DropdownItem>
                  <DropdownItem
                    key="star"
                    startContent={<Star className="h-4 w-4" />}
                    onClick={() => onFileAction('toggleStar', file)}
                  >
                    {file.isStarred ? 'Remove Star' : 'Add Star'}
                  </DropdownItem>
                  <DropdownItem
                    key="trash"
                    startContent={<Trash2 className="h-4 w-4" />}
                    className="text-danger"
                    onClick={() => onFileAction('moveToTrash', file)}
                  >
                    Move to Trash
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>

            <div className="space-y-1">
              <p className="font-medium text-sm truncate">{file.name}</p>
              {viewMode === 'list' && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatFileSize(file.size)}</span>
                  <span>{formatDate(file.updatedAt)}</span>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  )
}
