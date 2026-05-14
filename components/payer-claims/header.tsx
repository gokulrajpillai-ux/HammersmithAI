"use client"

import { Home, ChevronRight, Building2, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { SelectedPayer } from "@/app/payer-claims/page"

interface PayerHeaderProps {
  selectedPayer: SelectedPayer
}

export function PayerHeader({ selectedPayer }: PayerHeaderProps) {
  return (
    <header className="border-b border-border bg-card px-4 lg:px-6 py-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 pl-12 md:pl-0">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Home className="size-4" />
            <ChevronRight className="size-3" />
            <span>Claims</span>
            <ChevronRight className="size-3" />
            <span className="text-foreground font-medium">Indian Payer Workspace</span>
          </nav>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl lg:text-2xl font-semibold text-foreground">
                Indian Payer Claims Workspace
              </h1>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  selectedPayer.type === "pmjay" 
                    ? "bg-orange-500/10 text-orange-500 border-orange-500/20" 
                    : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                }`}
              >
                {selectedPayer.type === "pmjay" ? (
                  <Heart className="size-3 mr-1" />
                ) : (
                  <Building2 className="size-3 mr-1" />
                )}
                {selectedPayer.name}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
