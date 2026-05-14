"use client"

import { useState } from "react"
import { toast } from "sonner"
import { 
  Sparkles, 
  FileUp, 
  FileText, 
  Send, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Building,
  User,
  Stethoscope,
  XCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import type { AuthRequest } from "@/app/prior-auth/page"

interface AuthWorkspaceProps {
  request: AuthRequest | null
}

const statusSteps = [
  { key: "submitted", label: "Submitted" },
  { key: "ai-review", label: "AI Policy Review" },
  { key: "documentation", label: "Clinical Documentation" },
  { key: "sent-to-payer", label: "Sent to Payer" },
]

const getStatusIndex = (status: AuthRequest["status"]) => {
  const idx = statusSteps.findIndex(s => s.key === status)
  return idx >= 0 ? idx : 0
}

export function AuthWorkspace({ request }: AuthWorkspaceProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!request) {
    return (
      <Card className="bg-card border-border h-full min-h-[500px] flex items-center justify-center">
        <div className="text-center p-8">
          <div className="size-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <FileText className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Select a Request</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Choose an authorization request from the queue to view details and manage the approval workflow.
          </p>
        </div>
      </Card>
    )
  }

  const currentStep = getStatusIndex(request.status)
  const progressPercent = ((currentStep + 1) / statusSteps.length) * 100

  const handleUpload = () => {
    setIsUploading(true)
    setTimeout(() => {
      setIsUploading(false)
      toast.success("Document Uploaded", {
        description: "Medical record has been attached and is being analyzed by AI.",
      })
    }, 1500)
  }

  const handleGenerateLetter = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      toast.success("Letter Generated", {
        description: "AI-drafted physician letter is ready for review.",
      })
    }, 2000)
  }

  const handleSubmitToPayer = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success("Submitted to Payer Portal", {
        description: `Authorization request ${request.id} has been submitted to ${request.payer}.`,
      })
    }, 2000)
  }

  return (
    <div className="space-y-4">
      {/* Case Header */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {request.id}
                <Badge variant="outline" className="font-normal">
                  {request.procedureCode}
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1">{request.procedureDesc}</CardDescription>
            </div>
            <Badge 
              className={cn(
                request.riskScore === "high" && "bg-destructive",
                request.riskScore === "medium" && "bg-warning text-warning-foreground",
                request.riskScore === "low" && "bg-success"
              )}
            >
              {request.riskScore === "high" ? "High" : request.riskScore === "medium" ? "Medium" : "Low"} Risk
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Patient and Payer Info */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <User className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Patient:</span>
              <span className="font-medium">{request.patientName}</span>
              <span className="text-muted-foreground">({request.patientMRN})</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Building className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Payer:</span>
              <span className="font-medium">{request.payer}</span>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Authorization Progress</span>
              <span className="font-medium">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <div className="flex justify-between">
              {statusSteps.map((step, idx) => (
                <div 
                  key={step.key}
                  className={cn(
                    "flex flex-col items-center gap-1",
                    idx <= currentStep ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <div className={cn(
                    "size-6 rounded-full flex items-center justify-center text-xs",
                    idx < currentStep && "bg-primary text-primary-foreground",
                    idx === currentStep && "bg-primary/20 text-primary border-2 border-primary",
                    idx > currentStep && "bg-muted text-muted-foreground"
                  )}>
                    {idx < currentStep ? <CheckCircle className="size-3" /> : idx + 1}
                  </div>
                  <span className="text-[10px] text-center hidden sm:block max-w-[80px]">{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinical Summary Card */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="size-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">AI Clinical Summary</CardTitle>
              <CardDescription className="text-xs">Auto-generated from patient records</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 rounded-lg bg-secondary/50 text-sm leading-relaxed">
            <Stethoscope className="size-4 text-muted-foreground inline mr-2" />
            {request.clinicalSummary}
          </div>

          {/* Missing Documentation */}
          {request.missingDocs.length > 0 && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="size-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">Missing Documentation</span>
              </div>
              <ul className="space-y-1">
                {request.missingDocs.map((doc, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                    <XCircle className="size-3 text-destructive" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payer Policy Match Accordion */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="size-4" />
            AI Policy Analysis
          </CardTitle>
          <CardDescription className="text-xs">
            How clinical documentation matches payer medical policy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {request.policyMatches.map((policy, idx) => (
              <AccordionItem key={idx} value={`policy-${idx}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    {policy.match ? (
                      <CheckCircle className="size-4 text-success" />
                    ) : (
                      <XCircle className="size-4 text-destructive" />
                    )}
                    <span className="text-sm font-medium">{policy.clause}</span>
                    <Badge variant={policy.match ? "default" : "destructive"} className="text-xs ml-auto mr-2">
                      {policy.match ? "Matched" : "Not Met"}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pl-7">
                  {policy.description}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card className="bg-card border-border sticky bottom-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2" 
                onClick={handleUpload} 
                disabled={isUploading}
              >
                {isUploading ? (
                  <span className="size-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                ) : (
                  <FileUp className="size-4" />
                )}
                <span className="hidden sm:inline">Upload Record</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2" 
                onClick={handleGenerateLetter} 
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <span className="size-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                <span className="hidden sm:inline">Generate Letter</span>
              </Button>
            </div>
            <div className="flex-1" />
            <Button 
              size="sm" 
              className="gap-2" 
              onClick={handleSubmitToPayer} 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  Submit to Payer
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
