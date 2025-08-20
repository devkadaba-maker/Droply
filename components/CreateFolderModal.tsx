"use client"

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal"
import { Button } from "@heroui/button"
import { Input } from "@heroui/input"
import { useState } from 'react'

interface CreateFolderModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (folderName: string) => Promise<void>
  isLoading: boolean
}

export default function CreateFolderModal({ isOpen, onClose, onCreate, isLoading }: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState('')

  const handleSubmit = async () => {
    if (!folderName.trim()) return

    await onCreate(folderName.trim())
    setFolderName('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Create New Folder</ModalHeader>
        <ModalBody>
          <Input
            label="Folder Name"
            placeholder="Enter folder name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={isLoading}
            isDisabled={!folderName.trim()}
          >
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
