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
import { Input } from "@heroui/input"
import { FolderPlus } from "lucide-react"

interface CreateFolderModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (folderName: string) => Promise<void>
  isLoading: boolean
}

export default function CreateFolderModal({ 
  isOpen, 
  onClose, 
  onCreate, 
  isLoading 
}: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!folderName.trim()) {
      setError("Folder name is required")
      return
    }

    if (folderName.length > 255) {
      setError("Folder name is too long")
      return
    }

    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*]/
    if (invalidChars.test(folderName)) {
      setError("Folder name contains invalid characters")
      return
    }

    try {
      await onCreate(folderName.trim())
      handleClose()
    } catch (error) {
      setError("Failed to create folder. Please try again.")
    }
  }

  const handleClose = () => {
    setFolderName("")
    setError("")
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader className="flex gap-2 items-center">
            <FolderPlus className="h-5 w-5 text-primary" />
            <span>Create New Folder</span>
          </ModalHeader>
          
          <ModalBody>
            <div className="space-y-4">
              <div>
                <Input
                  label="Folder Name"
                  placeholder="Enter folder name"
                  value={folderName}
                  onChange={(e) => {
                    setFolderName(e.target.value)
                    setError("")
                  }}
                  isInvalid={!!error}
                  errorMessage={error}
                  autoFocus
                  maxLength={255}
                />
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p>Folder names cannot contain: &lt; &gt; : &quot; / \ | ? *</p>
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button 
              variant="light" 
              onClick={handleClose}
              isDisabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              type="submit"
              isLoading={isLoading}
              isDisabled={!folderName.trim()}
            >
              {isLoading ? "Creating..." : "Create Folder"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
