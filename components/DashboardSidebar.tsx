"use client"

import { cn } from "@/lib/utils"
import { Button } from "@heroui/button"
import { 
  FileText, 
  Star, 
  Trash2, 
  FolderPlus, 
  Upload,
  Home,
  Settings,
  LogOut 
} from "lucide-react"
import { useClerk, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface DashboardSidebarProps {
  activeSection: 'all' | 'starred' | 'trash'
  onSectionChange: (section: 'all' | 'starred' | 'trash') => void
  onCreateFolderClick: () => void
  onUploadClick: () => void
}

export default function DashboardSidebar({ 
  activeSection, 
  onSectionChange,
  onCreateFolderClick,
  onUploadClick 
}: DashboardSidebarProps) {
  const { user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const sidebarItems = [
    {
      key: 'all' as const,
      label: 'All Files',
      icon: Home,
      count: null
    },
    {
      key: 'starred' as const,
      label: 'Starred',
      icon: Star,
      count: null
    },
    {
      key: 'trash' as const,
      label: 'Trash',
      icon: Trash2,
      count: null
    }
  ]

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 min-h-screen flex flex-col hidden md:flex">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Droply</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Cloud Storage</p>
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-2">
        <Button
          onClick={onUploadClick}
          color="primary"
          className="w-full justify-start"
          startContent={<Upload className="h-4 w-4" />}
        >
          Upload Files
        </Button>
        <Button
          onClick={onCreateFolderClick}
          variant="bordered"
          className="w-full justify-start"
          startContent={<FolderPlus className="h-4 w-4" />}
        >
          New Folder
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.key
            
            return (
              <Button
                key={item.key}
                variant={isActive ? "flat" : "light"}
                color={isActive ? "primary" : "default"}
                className={cn(
                  "w-full justify-start h-10",
                  isActive && "bg-primary-50 dark:bg-primary-900/20"
                )}
                onClick={() => onSectionChange(item.key)}
                startContent={<Icon className="h-4 w-4" />}
              >
                <span className="flex-1 text-left">{item.label}</span>
                {item.count && (
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {item.count}
                  </span>
                )}
              </Button>
            )
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
              {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.firstName || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        </div>
        
        <div className="space-y-1">
          <Button
            variant="light"
            className="w-full justify-start h-8 text-gray-600 dark:text-gray-400"
            startContent={<Settings className="h-4 w-4" />}
            as={Link}
            href="/settings"
          >
            Settings
          </Button>
          <Button
            variant="light"
            className="w-full justify-start h-8 text-gray-600 dark:text-gray-400"
            onClick={handleSignOut}
            startContent={<LogOut className="h-4 w-4" />}
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  )
}
