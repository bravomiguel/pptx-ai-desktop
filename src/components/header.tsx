"use client"

import { Button } from "@/components/ui/button"
import { User, FileText } from "lucide-react"
import Link from "next/link"

export default function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b bg-background">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-black text-white rounded flex items-center justify-center text-sm font-bold">
          v0
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/pptx-converter">
          <Button variant="ghost" size="icon" title="PPTX Converter">
            <FileText className="w-4 h-4" />
          </Button>
        </Link>
        <Button variant="ghost" size="icon">
          <User className="w-4 h-4" />
        </Button>
      </div>
    </header>
  )
} 