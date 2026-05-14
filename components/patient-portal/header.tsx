"use client"

import { Home, ChevronRight, Wallet, Eye, EyeOff, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { PatientData } from "@/app/patient-portal/page"

interface PatientHeaderProps {
  patient: PatientData
  isStaffView: boolean
  onToggleView: () => void
}

export function PatientHeader({ patient, isStaffView, onToggleView }: PatientHeaderProps) {
  return (
    <header className="border-b border-border bg-card px-4 lg:px-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Breadcrumbs */}
        <div className="flex flex-col gap-2 pl-12 md:pl-0">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Home className="size-4" />
            <ChevronRight className="size-3" />
            <span>Patient Portal</span>
            <ChevronRight className="size-3" />
            <span className="text-foreground font-medium">Financial Dashboard</span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-bold text-foreground flex items-center gap-2">
              <Wallet className="size-5 lg:size-6 text-primary" />
              Patient Financial Portal
            </h1>
          </div>
        </div>

        {/* Patient Info + View Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-secondary/50">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="size-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{patient.name}</p>
              <p className="text-xs text-muted-foreground">{patient.accountNumber}</p>
            </div>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={onToggleView}
          >
            {isStaffView ? (
              <>
                <EyeOff className="size-4" />
                <span className="hidden sm:inline">Staff View</span>
              </>
            ) : (
              <>
                <Eye className="size-4" />
                <span className="hidden sm:inline">Patient View</span>
              </>
            )}
            <Badge variant="secondary" className="ml-1 text-xs">
              {isStaffView ? "Internal" : "External"}
            </Badge>
          </Button>
        </div>
      </div>
    </header>
  )
}
