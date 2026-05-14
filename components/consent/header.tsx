"use client"

import { Home, ChevronRight, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function ConsentHeader() {
  return (
    <header className="border-b border-border bg-card px-4 lg:px-6 py-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 pl-12 md:pl-0">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Home className="size-4" />
            <ChevronRight className="size-3" />
            <span>Data Management</span>
            <ChevronRight className="size-3" />
            <span className="text-foreground font-medium">Consent Manager</span>
          </nav>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl lg:text-2xl font-semibold text-foreground">
                Healthcare Consent Management
              </h1>
              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                <Shield className="size-3 mr-1" />
                ABDM Compliant
              </Badge>
            </div>
            <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span>12 Active</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-amber-500" />
                <span>3 Pending</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
