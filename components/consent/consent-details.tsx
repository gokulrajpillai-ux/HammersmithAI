"use client"

import { 
  FileText, Clock, CheckCircle, XCircle, AlertTriangle, 
  User, Calendar, Target, Timer, RefreshCw, Download
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import type { ConsentRequest } from "@/app/consent-manager/page"

interface ConsentDetailsProps {
  consent: ConsentRequest | null
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: "Pending Patient Approval",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  granted: {
    icon: CheckCircle,
    label: "Consent Granted",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  denied: {
    icon: XCircle,
    label: "Consent Denied",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  expired: {
    icon: AlertTriangle,
    label: "Consent Expired",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
}

const timelineSteps = [
  { id: 1, label: "Request Sent", completed: true },
  { id: 2, label: "Pending Patient Approval", completed: false, active: true },
  { id: 3, label: "Consent Granted", completed: false },
]

export function ConsentDetails({ consent }: ConsentDetailsProps) {
  if (!consent) {
    return (
      <Card className="bg-card border-border h-full">
        <CardContent className="flex flex-col items-center justify-center h-96 text-center">
          <FileText className="size-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Select a consent request to view details</p>
        </CardContent>
      </Card>
    )
  }

  const status = statusConfig[consent.status]
  const StatusIcon = status.icon

  const handleResend = () => {
    toast.success("Reminder Sent", {
      description: "Patient will receive a new notification on their ABHA App"
    })
  }

  const handleFetchRecords = () => {
    toast.success("Fetching Records", {
      description: "Health records are being retrieved from ABDM"
    })
  }

  // Determine timeline state based on consent status
  const getTimelineState = () => {
    if (consent.status === "granted") {
      return timelineSteps.map(step => ({ ...step, completed: true, active: false }))
    } else if (consent.status === "denied" || consent.status === "expired") {
      return [
        { ...timelineSteps[0], completed: true },
        { id: 2, label: consent.status === "denied" ? "Consent Denied" : "Consent Expired", completed: true, active: false },
        { ...timelineSteps[2], completed: false },
      ]
    }
    return timelineSteps
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Consent Details</CardTitle>
          <Badge variant="outline" className={`${status.bgColor} ${status.color} border-0`}>
            <StatusIcon className="size-3 mr-1" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Patient Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <User className="size-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Patient</p>
              <p className="font-medium">{consent.patientName}</p>
              <p className="text-xs text-muted-foreground font-mono">{consent.abhaAddress}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="size-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Request Date</p>
              <p className="font-medium text-sm">{consent.requestDate}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Target className="size-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Purpose</p>
              <p className="font-medium text-sm">{consent.purpose}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Timer className="size-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="font-medium text-sm">{consent.duration}</p>
              {consent.expiryDate && (
                <p className="text-xs text-muted-foreground">Expires: {consent.expiryDate}</p>
              )}
            </div>
          </div>
        </div>

        {/* Record Types */}
        <div>
          <p className="text-sm font-medium mb-2">Requested Records</p>
          <div className="flex flex-wrap gap-2">
            {consent.recordTypes.map((record) => (
              <Badge key={record} variant="secondary" className="text-xs">
                <FileText className="size-3 mr-1" />
                {record}
              </Badge>
            ))}
          </div>
        </div>

        {/* Live Status Tracker */}
        <div>
          <p className="text-sm font-medium mb-4">Status Timeline</p>
          <div className="space-y-4">
            {getTimelineState().map((step, index) => (
              <div key={step.id} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`size-8 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? "bg-emerald-500 text-white" 
                      : step.active 
                      ? "bg-amber-500 text-white animate-pulse"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="size-4" />
                    ) : step.active ? (
                      <Clock className="size-4" />
                    ) : (
                      <span className="text-xs">{step.id}</span>
                    )}
                  </div>
                  {index < getTimelineState().length - 1 && (
                    <div className={`w-0.5 h-8 ${
                      step.completed ? "bg-emerald-500" : "bg-border"
                    }`} />
                  )}
                </div>
                <div className="pt-1">
                  <p className={`text-sm font-medium ${
                    step.completed 
                      ? "text-foreground" 
                      : step.active 
                      ? "text-amber-500"
                      : "text-muted-foreground"
                  }`}>
                    {step.label}
                  </p>
                  {step.active && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Waiting for patient to approve via ABHA App
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar for Granted Consents */}
        {consent.status === "granted" && consent.expiryDate && (
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Consent Validity</span>
              <span className="text-emerald-500">Active</span>
            </div>
            <Progress value={60} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Expires on {consent.expiryDate}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {consent.status === "pending" && (
            <Button variant="outline" className="flex-1 gap-2" onClick={handleResend}>
              <RefreshCw className="size-4" />
              Resend Request
            </Button>
          )}
          {consent.status === "granted" && (
            <Button className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={handleFetchRecords}>
              <Download className="size-4" />
              Fetch Health Records
            </Button>
          )}
          {(consent.status === "denied" || consent.status === "expired") && (
            <Button variant="outline" className="flex-1 gap-2" onClick={handleResend}>
              <RefreshCw className="size-4" />
              Request Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
