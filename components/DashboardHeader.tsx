"use client"

import { Button } from "@heroui/button"
import { Input } from "@heroui/input"
import { User, Upload, Plus, Search, Grid, List } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

interface DashboardHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  onUploadClick: () => void
  onCreateFolderClick: () => void
}

export default function DashboardHeader({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onUploadClick,
  onCreateFolderClick
}: DashboardHeaderProps) {
  const { user } = useUser()

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-foreground">Droply</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="light"
              startContent={<Upload className="h-4 w-4" />}
              onClick={onUploadClick}
            >
              Upload
            </Button>
            <Button
              variant="light"
              startContent={<Plus className="h-4 w-4" />}
              onClick={onCreateFolderClick}
            >
              New Folder
            </Button>
            <input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                // Handle file upload here
                console.log('Files selected:', e.target.files)
              }}
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className={viewMode === 'grid' ? 'bg-primary text-primary-foreground' : ''}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onClick={() => onViewModeChange('list')}
              className={viewMode === 'list' ? 'bg-primary text-primary-foreground' : ''}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium">{user?.firstName || user?.username}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
