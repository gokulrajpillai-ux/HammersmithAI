"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Home, ChevronRight, FileCode, Save, RotateCcw, Settings, HelpCircle, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CodingHeaderProps {
  pendingCount: number
  confirmedCount: number
}

export function CodingHeader({ pendingCount, confirmedCount }: CodingHeaderProps) {
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success("Progress Saved", {
        description: "All coding decisions have been saved successfully.",
      })
    }, 1000)
  }

  const handleReset = () => {
    toast.info("Reset Coding Session", {
      description: "This will clear all confirmed codes. Are you sure?",
      action: {
        label: "Confirm",
        onClick: () => toast.success("Session reset successfully"),
      },
    })
  }

  return (
    <header className="border-b border-border bg-card px-4 lg:px-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Breadcrumbs */}
        <div className="flex flex-col gap-2 pl-12 md:pl-0">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Home className="size-4" />
            <ChevronRight className="size-3" />
            <span>Medical Coding</span>
            <ChevronRight className="size-3" />
            <span className="text-foreground font-medium">Smart Coding Assistant</span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-bold text-foreground flex items-center gap-2">
              <FileCode className="size-5 lg:size-6 text-primary" />
              Smart Medical Coding
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1 text-warning border-warning/30 bg-warning/10">
                <Clock className="size-3" />
                {pendingCount} Pending
              </Badge>
              <Badge variant="outline" className="gap-1 text-success border-success/30 bg-success/10">
                <CheckCircle className="size-3" />
                {confirmedCount} Confirmed
              </Badge>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleReset}>
                  <RotateCcw className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset Session</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Coding Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <HelpCircle className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Help & Guidelines</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <>
                <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save Progress
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
