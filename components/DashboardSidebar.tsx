"use client"

import { Button } from "@heroui/button"
import { Folder, Star, Trash2 } from 'lucide-react'

interface DashboardSidebarProps {
  activeSection: 'all' | 'starred' | 'trash'
  onSectionChange: (section: 'all' | 'starred' | 'trash') => void
}

export default function DashboardSidebar({ activeSection, onSectionChange }: DashboardSidebarProps) {
  return (
    <aside className="w-64 bg-card border-r border-border p-4">
      <nav className="space-y-2">
        <Button
          variant={activeSection === 'all' ? 'solid' : 'light'}
          className="w-full justify-start"
          startContent={<Folder className="h-4 w-4" />}
          onClick={() => onSectionChange('all')}
        >
          All Files
        </Button>
        <Button
          variant={activeSection === 'starred' ? 'solid' : 'light'}
          className="w-full justify-start"
          startContent={<Star className="h-4 w-4" />}
          onClick={() => onSectionChange('starred')}
        >
          Starred
        </Button>
        <Button
          variant={activeSection === 'trash' ? 'solid' : 'light'}
          className="w-full justify-start"
          startContent={<Trash2 className="h-4 w-4" />}
          onClick={() => onSectionChange('trash')}
        >
          Trash
        </Button>
      </nav>
    </aside>
  )
}
