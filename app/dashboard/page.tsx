"use client"

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import DashboardSidebar from '@/components/DashboardSidebar'
import DashboardHeader from '@/components/DashboardHeader'
import FileGrid from '@/components/FileGrid'
import Breadcrumb from '@/components/Breadcrumb'
import CreateFolderModal from '@/components/CreateFolderModal'
import FileUpload from '@/components/FileUpload'
import { useDisclosure } from "@heroui/modal"

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

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [breadcrumb, setBreadcrumb] = useState<Array<{id: string, name: string}>>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeSection, setActiveSection] = useState<'all' | 'starred' | 'trash'>('all')

  const { isOpen: isCreateFolderOpen, onOpen: onCreateFolderOpen, onClose: onCreateFolderClose } = useDisclosure()
  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure()
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [isLoaded, user, router])

  // Fetch files
  const fetchFiles = async (parentId: string | null = null) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (parentId) params.append('parentId', parentId)

      const response = await fetch(`/api/files?${params}`)
      if (response.ok) {
        const data = await response.json()
        setFiles(data)
      }
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    if (user) {
      fetchFiles(currentFolder)
    }
  }, [user, currentFolder])

  // Handle folder click
  const handleFolderClick = (folder: FileItem) => {
    setCurrentFolder(folder.id)
    setBreadcrumb(prev => [...prev, { id: folder.id, name: folder.name }])
  }

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (index: number) => {
    const newBreadcrumb = breadcrumb.slice(0, index + 1)
    const targetFolder = index === -1 ? null : newBreadcrumb[newBreadcrumb.length - 1]?.id || null
    setCurrentFolder(targetFolder)
    setBreadcrumb(newBreadcrumb)
  }

  // Handle file actions
  const handleFileAction = async (action: string, file: FileItem) => {
    try {
      if (action === 'toggleStar') {
        await fetch(`/api/files/${file.id}/star`, { method: 'PATCH' })
      } else if (action === 'moveToTrash') {
        await fetch(`/api/files/${file.id}/trash`, { method: 'PATCH' })
      } else if (action === 'download' && file.fileUrl) {
        window.open(file.fileUrl, '_blank')
      } else if (action === 'preview' && file.fileUrl) {
        window.open(file.fileUrl, '_blank')
      }
      fetchFiles(currentFolder) // Refresh the file list
    } catch (error) {
      console.error('Error performing file action:', error)
    }
  }

  // Create new folder
  const handleCreateFolder = async (folderName: string) => {
    if (!folderName.trim() || !user) return

    try {
      setIsCreatingFolder(true)
      const response = await fetch('/api/folders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: folderName.trim(),
          userId: user.id,
          parentId: currentFolder
        })
      })

      if (response.ok) {
        fetchFiles(currentFolder) // Refresh the file list
      }
    } catch (error) {
      console.error('Error creating folder:', error)
    } finally {
      setIsCreatingFolder(false)
    }
  }

  // Handle file upload
  const handleUploadClick = () => {
    onUploadOpen()
  }

  // Handle upload complete
  const handleUploadComplete = () => {
    fetchFiles(currentFolder) // Refresh the file list
    onUploadClose()
  }

  // Filter files based on active section and search
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSection = activeSection === 'all' ||
      (activeSection === 'starred' && file.isStarred) ||
      (activeSection === 'trash' && file.isTrash)
    return matchesSearch && matchesSection
  })

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <DashboardSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onCreateFolderClick={onCreateFolderOpen}
        onUploadClick={handleUploadClick}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onUploadClick={handleUploadClick}
          onCreateFolderClick={onCreateFolderOpen}
        />

        <main className="flex-1 p-6">
          <Breadcrumb
            items={breadcrumb}
            onNavigate={handleBreadcrumbClick}
          />

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <FileGrid
              files={filteredFiles}
              viewMode={viewMode}
              onFolderClick={handleFolderClick}
              onFileAction={handleFileAction}
            />
          )}
        </main>
      </div>

      <CreateFolderModal
        isOpen={isCreateFolderOpen}
        onClose={onCreateFolderClose}
        onCreate={handleCreateFolder}
        isLoading={isCreatingFolder}
      />

      <FileUpload
        isOpen={isUploadOpen}
        onClose={onUploadClose}
        onUploadComplete={handleUploadComplete}
        currentFolder={currentFolder}
      />
    </div>
  )
}

