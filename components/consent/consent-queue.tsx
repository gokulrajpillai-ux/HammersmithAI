"use client"

import { Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ConsentRequest } from "@/app/consent-manager/page"

interface ConsentQueueProps {
  onSelect: (consent: ConsentRequest) => void
  selectedId?: string
}

const consentRequests: ConsentRequest[] = [
  {
    id: "CON-001",
    patientName: "Rajesh Kumar",
    abhaAddress: "rajesh.kumar@abdm",
    recordTypes: ["Diagnostic Reports", "Prescriptions"],
    purpose: "Insurance Claim Processing",
    duration: "Until Discharge",
    status: "pending",
    requestDate: "May 14, 2026 10:30 AM",
  },
  {
    id: "CON-002",
    patientName: "Priya Sharma",
    abhaAddress: "priya.sharma@abdm",
    recordTypes: ["Discharge Summaries", "Diagnostic Reports"],
    purpose: "Medical Coding Verification",
    duration: "3 Days",
    status: "granted",
    requestDate: "May 13, 2026 02:15 PM",
    expiryDate: "May 16, 2026",
  },
  {
    id: "CON-003",
    patientName: "Amit Patel",
    abhaAddress: "amit.patel@abdm",
    recordTypes: ["Immunization Records"],
    purpose: "Continuity of Care",
    duration: "1 Week",
    status: "granted",
    requestDate: "May 12, 2026 09:00 AM",
    expiryDate: "May 19, 2026",
  },
  {
    id: "CON-004",
    patientName: "Neha Gupta",
    abhaAddress: "neha.gupta@abdm",
    recordTypes: ["Prescriptions"],
    purpose: "Second Opinion",
    duration: "1 Day",
    status: "expired",
    requestDate: "May 10, 2026 11:45 AM",
    expiryDate: "May 11, 2026",
  },
  {
    id: "CON-005",
    patientName: "Vikram Singh",
    abhaAddress: "vikram.singh@abdm",
    recordTypes: ["Diagnostic Reports", "Discharge Summaries"],
    purpose: "Insurance Claim Processing",
    duration: "Until Discharge",
    status: "denied",
    requestDate: "May 09, 2026 04:30 PM",
  },
]

const statusConfig = {
  pending: {
    icon: Clock,
    label: "Pending",
    className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  granted: {
    icon: CheckCircle,
    label: "Granted",
    className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  denied: {
    icon: XCircle,
    label: "Denied",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  expired: {
    icon: AlertTriangle,
    label: "Expired",
    className: "bg-muted text-muted-foreground border-border",
  },
}

export function ConsentQueue({ onSelect, selectedId }: ConsentQueueProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Consent Requests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {consentRequests.map((consent) => {
          const status = statusConfig[consent.status]
          const StatusIcon = status.icon
          return (
            <div
              key={consent.id}
              className={cn(
                "p-3 rounded-lg border cursor-pointer transition-colors",
                selectedId === consent.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => onSelect(consent)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{consent.patientName}</p>
                    <Badge variant="outline" className={cn("text-xs", status.className)}>
                      <StatusIcon className="size-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {consent.abhaAddress}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {consent.recordTypes.slice(0, 2).join(", ")}
                    {consent.recordTypes.length > 2 && ` +${consent.recordTypes.length - 2}`}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {consent.requestDate.split(" ")[0]} {consent.requestDate.split(" ")[1]}
                </span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
