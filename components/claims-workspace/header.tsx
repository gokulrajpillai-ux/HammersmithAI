"use client"

import { Home, ChevronRight, Brain } from "lucide-react"
import Link from "next/link"

export function ClaimsHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur px-4 lg:px-6 py-4">
      <div className="flex flex-col gap-2 pl-12 md:pl-0">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            <Home className="size-4" />
          </Link>
          <ChevronRight className="size-3" />
          <span>Dashboard</span>
          <ChevronRight className="size-3" />
          <span className="text-foreground">AI Claims Workspace</span>
        </nav>
        
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
            <Brain className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">AI Claims & Coding Workspace</h1>
            <p className="text-sm text-muted-foreground">Intelligent claim analysis with PM-JAY rate checking</p>
          </div>
        </div>
      </div>
    </header>
  )
}
