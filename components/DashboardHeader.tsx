"use client"

import { Button } from "@heroui/button"
import { Input } from "@heroui/input"
import { 
  Search, 
  Grid3x3, 
  List,
  Upload,
  FolderPlus,
  Sun,
  Moon
} from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

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
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search files and folders..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            startContent={<Search className="h-4 w-4 text-gray-400" />}
            classNames={{
              input: "text-sm",
              inputWrapper: "h-10"
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              isIconOnly
              size="sm"
              variant={viewMode === 'grid' ? 'solid' : 'light'}
              color={viewMode === 'grid' ? 'primary' : 'default'}
              onClick={() => onViewModeChange('grid')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant={viewMode === 'list' ? 'solid' : 'light'}
              color={viewMode === 'list' ? 'primary' : 'default'}
              onClick={() => onViewModeChange('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Theme Toggle */}
          <Button
            isIconOnly
            variant="light"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Mobile Action Buttons */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              isIconOnly
              color="primary"
              onClick={onUploadClick}
            >
              <Upload className="h-4 w-4" />
            </Button>
            <Button
              isIconOnly
              variant="bordered"
              onClick={onCreateFolderClick}
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
