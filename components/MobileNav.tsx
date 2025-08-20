"use client"

import { useState } from "react"
import { Button } from "@heroui/button"
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter
} from "@heroui/drawer"
import { 
  Menu,
  X,
  Home,
  Star,
  Trash2,
  Settings,
  LogOut,
  Upload,
  FolderPlus
} from "lucide-react"
import { useClerk, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface MobileNavProps {
  activeSection: 'all' | 'starred' | 'trash'
  onSectionChange: (section: 'all' | 'starred' | 'trash') => void
  onCreateFolderClick: () => void
  onUploadClick: () => void
}

export default function MobileNav({ 
  activeSection, 
  onSectionChange,
  onCreateFolderClick,
  onUploadClick 
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
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

  const handleNavClick = (section: typeof activeSection) => {
    onSectionChange(section)
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <Button
          isIconOnly
          variant="light"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Drawer */}
      <Drawer 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        placement="left"
      >
        <DrawerContent>
          <DrawerHeader className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Droply</h2>
              <p className="text-sm text-gray-500">Cloud Storage</p>
            </div>
            <Button
              isIconOnly
              variant="light"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </DrawerHeader>

          <DrawerBody>
            {/* Action Buttons */}
            <div className="space-y-2 mb-6">
              <Button
                onClick={() => {
                  onUploadClick()
                  setIsOpen(false)
                }}
                color="primary"
                className="w-full justify-start"
                startContent={<Upload className="h-4 w-4" />}
              >
                Upload Files
              </Button>
              <Button
                onClick={() => {
                  onCreateFolderClick()
                  setIsOpen(false)
                }}
                variant="bordered"
                className="w-full justify-start"
                startContent={<FolderPlus className="h-4 w-4" />}
              >
                New Folder
              </Button>
            </div>

            {/* Navigation */}
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
                      "w-full justify-start h-12",
                      isActive && "bg-primary-50 dark:bg-primary-900/20"
                    )}
                    onClick={() => handleNavClick(item.key)}
                    startContent={<Icon className="h-4 w-4" />}
                  >
                    <span className="flex-1 text-left">{item.label}</span>
                  </Button>
                )
              })}
            </div>
          </DrawerBody>

          <DrawerFooter className="border-t">
            {/* User Info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
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
            
            <div className="space-y-2 w-full">
              <Button
                variant="light"
                className="w-full justify-start"
                startContent={<Settings className="h-4 w-4" />}
                as={Link}
                href="/settings"
                onClick={() => setIsOpen(false)}
              >
                Settings
              </Button>
              <Button
                variant="light"
                className="w-full justify-start"
                onClick={() => {
                  handleSignOut()
                  setIsOpen(false)
                }}
                startContent={<LogOut className="h-4 w-4" />}
              >
                Sign out
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
