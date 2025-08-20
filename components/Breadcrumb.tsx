"use client"

import { Button } from "@heroui/button"

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
    <div className="flex items-center space-x-2 mb-6">
      <Button
        variant="light"
        size="sm"
        onClick={() => onNavigate(-1)}
      >
        Home
      </Button>
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center space-x-2">
          <span className="text-muted-foreground">/</span>
          <Button
            variant="light"
            size="sm"
            onClick={() => onNavigate(index)}
          >
            {item.name}
          </Button>
        </div>
      ))}
    </div>
  )
}
