"use client"

import { Home, ChevronRight, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function ABHAHeader() {
  return (
    <header className="border-b border-border bg-card px-4 lg:px-6 py-4">
      <div className="flex flex-col gap-4">
        {/* Breadcrumbs */}
        <div className="flex flex-col gap-2 pl-12 md:pl-0">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Home className="size-4" />
            <ChevronRight className="size-3" />
            <span>Patient Management</span>
            <ChevronRight className="size-3" />
            <span className="text-foreground font-medium">ABHA Onboarding</span>
          </nav>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl lg:text-2xl font-semibold text-foreground">
                Patient Identity & ABHA Onboarding
              </h1>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-6">
                      <HelpCircle className="size-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Link patients with their 14-digit ABHA ID from the Ayushman Bharat Digital Mission for seamless health records access.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-emerald-500">ABDM Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
