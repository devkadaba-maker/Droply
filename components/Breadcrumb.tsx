"use client"

import { Button } from "@heroui/button"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbItem {
  id: string
  name: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  onNavigate: (index: number) => void
}

export default function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-1 mb-6">
      <Button
        variant="light"
        size="sm"
        onClick={() => onNavigate(-1)}
        startContent={<Home className="h-4 w-4" />}
        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
      >
        Home
      </Button>
      
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center">
          <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
          <Button
            variant="light"
            size="sm"
            onClick={() => onNavigate(index)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            {item.name}
          </Button>
        </div>
      ))}
    </nav>
  )
}
