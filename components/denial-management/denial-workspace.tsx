"use client"

import { useState } from "react"
import { toast } from "sonner"
import { 
  AlertTriangle, 
  User, 
  Building, 
  Calendar, 
  FileText, 
  Sparkles, 
  CheckCircle, 
  Send, 
  MessageSquare, 
  XCircle,
  Copy,
  RefreshCw
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import type { DeniedClaim } from "@/app/denial-management/page"

interface DenialWorkspaceProps {
  denial: DeniedClaim | null
  open: boolean
  onClose: () => void
}

const generateAppealLetter = (denial: DeniedClaim) => `Dear Claims Review Department,

Re: Appeal for Claim ${denial.id}
Patient: ${denial.patientName} (${denial.patientMrn})
Date of Service: ${denial.serviceDate}
Original Claim Amount: ${denial.totalCharge}

I am writing to formally appeal the denial of the above-referenced claim, which was denied under reason code ${denial.denialCode}.

After careful review of the patient's medical records and the applicable policy guidelines, we believe this denial was issued in error. The services rendered were medically necessary and appropriately documented as follows:

1. Clinical Indication: The patient presented with symptoms consistent with the diagnosis and required the specified treatment as part of their care plan.

2. Medical Necessity: Based on the clinical documentation, the services provided were essential for the patient's health outcome and aligned with standard medical practice guidelines.

3. Documentation Support: All required documentation, including physician notes, diagnostic reports, and prior authorization (where applicable), were submitted with the original claim.

We respectfully request that you reconsider this denial and process the claim for payment. Enclosed please find supporting documentation including:
- Complete medical records for the date of service
- Physician attestation letter
- Relevant clinical guidelines supporting medical necessity

Should you require any additional information, please contact our office at your earliest convenience.

Sincerely,
${denial.provider}
Revenue Cycle Management Department`

const documentChecklist = [
  { id: "physician-sig", label: "Physician Signature", required: true },
  { id: "clinical-note", label: "Clinical Notes", required: true },
  { id: "diagnosis-codes", label: "Diagnosis Codes (ICD-10)", required: true },
  { id: "procedure-codes", label: "Procedure Codes (CPT)", required: true },
  { id: "prior-auth", label: "Prior Authorization", required: false },
  { id: "medical-necessity", label: "Medical Necessity Letter", required: false },
]

export function DenialWorkspace({ denial, open, onClose }: DenialWorkspaceProps) {
  const [appealText, setAppealText] = useState("")
  const [checkedDocs, setCheckedDocs] = useState<string[]>(["physician-sig", "clinical-note", "diagnosis-codes", "procedure-codes"])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const handleOpen = () => {
    if (denial) {
      setAppealText(generateAppealLetter(denial))
    }
  }

  const handleRegenerate = () => {
    if (!denial) return
    setIsRegenerating(true)
    setTimeout(() => {
      setAppealText(generateAppealLetter(denial))
      setIsRegenerating(false)
      toast.success("Appeal letter regenerated")
    }, 1500)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(appealText)
    toast.success("Copied to clipboard")
  }

  const handleSubmitAppeal = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success("Appeal Submitted", {
        description: `Appeal for ${denial?.id} has been submitted to ${denial?.payer}.`,
      })
      onClose()
    }, 2000)
  }

  const handleRequestClinical = () => {
    toast.success("Request Sent", {
      description: "Clinical input request sent to the provider team.",
    })
  }

  const handleCloseSelfPay = () => {
    toast.info("Marked as Self-Pay", {
      description: "Claim has been moved to patient responsibility.",
    })
    onClose()
  }

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high": return "text-destructive"
      case "medium": return "text-warning"
      case "low": return "text-muted-foreground"
    }
  }

  if (!denial) return null

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent 
        className="w-full sm:max-w-2xl overflow-hidden flex flex-col p-0"
        onOpenAutoFocus={handleOpen}
      >
        <SheetHeader className="px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl flex items-center gap-2">
                <AlertTriangle className={`size-5 ${getPriorityColor(denial.aiPriority)}`} />
                Resolution Workspace
              </SheetTitle>
              <SheetDescription className="mt-1">
                {denial.id} - {denial.patientName}
              </SheetDescription>
            </div>
            <Badge 
              variant="outline" 
              className={`${
                denial.recoveryProbability >= 70 
                  ? "bg-success/10 text-success border-success/30" 
                  : denial.recoveryProbability >= 40
                  ? "bg-warning/10 text-warning border-warning/30"
                  : "bg-destructive/10 text-destructive border-destructive/30"
              }`}
            >
              {denial.recoveryProbability}% Recovery
            </Badge>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Claim Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <User className="size-3.5" />
                  <span className="text-xs">Patient</span>
                </div>
                <p className="font-medium">{denial.patientName}</p>
                <p className="text-xs text-muted-foreground">{denial.patientMrn}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Building className="size-3.5" />
                  <span className="text-xs">Payer</span>
                </div>
                <p className="font-medium">{denial.payer}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="size-3.5" />
                  <span className="text-xs">Service Date</span>
                </div>
                <p className="font-medium">{denial.serviceDate}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <FileText className="size-3.5" />
                  <span className="text-xs">Total Charge</span>
                </div>
                <p className="font-semibold text-lg">{denial.totalCharge}</p>
              </div>
            </div>

            {/* Denial Reason Explanation */}
            <Card className="border-destructive/30 bg-destructive/5">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-destructive">
                  <AlertTriangle className="size-4" />
                  Denial Reason: {denial.denialCode}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-sm text-muted-foreground">{denial.denialReason}</p>
                <div className="mt-3 p-3 rounded bg-card border border-border">
                  <p className="text-xs text-muted-foreground mb-1">AI Plain English Translation:</p>
                  <p className="text-sm text-foreground">
                    {denial.denialCode === "CO-4" && "The claim was denied because a required modifier was missing or incorrect. Review the procedure codes and ensure proper modifiers are applied."}
                    {denial.denialCode === "CO-16" && "The claim is missing required information or contains errors. Review all fields and resubmit with complete documentation."}
                    {denial.denialCode === "CO-27" && "Services were provided after the patient's insurance coverage ended. Verify eligibility dates before appeal."}
                    {denial.denialCode === "CO-50" && "The payer determined the service was not medically necessary. Appeal with supporting clinical documentation."}
                    {denial.denialCode === "PR-1" && "This is patient responsibility due to deductible. Consider patient payment options."}
                    {denial.denialCode === "CO-11" && "The diagnosis codes don't match the procedure performed. Review and correct coding before resubmission."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* AI Appeal Letter */}
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
                    <Sparkles className="size-4" />
                    AI-Generated Appeal Letter Draft
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2"
                      onClick={handleCopy}
                    >
                      <Copy className="size-3.5 mr-1" />
                      Copy
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2"
                      onClick={handleRegenerate}
                      disabled={isRegenerating}
                    >
                      <RefreshCw className={`size-3.5 mr-1 ${isRegenerating ? "animate-spin" : ""}`} />
                      Regenerate
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <Textarea 
                  value={appealText}
                  onChange={(e) => setAppealText(e.target.value)}
                  className="min-h-[300px] font-mono text-sm bg-card"
                  placeholder="Appeal letter will appear here..."
                />
              </CardContent>
            </Card>

            {/* Documentation Checklist */}
            <Card className="border-border">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" />
                  Documentation Checklist
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-3">
                  {documentChecklist.map((doc) => (
                    <label
                      key={doc.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer"
                    >
                      <Checkbox
                        checked={checkedDocs.includes(doc.id)}
                        onCheckedChange={(checked) => {
                          setCheckedDocs(
                            checked
                              ? [...checkedDocs, doc.id]
                              : checkedDocs.filter((id) => id !== doc.id)
                          )
                        }}
                      />
                      <span className="text-sm flex items-center gap-1.5">
                        {checkedDocs.includes(doc.id) ? (
                          <CheckCircle className="size-3.5 text-success" />
                        ) : (
                          <XCircle className="size-3.5 text-muted-foreground" />
                        )}
                        {doc.label}
                        {doc.required && <span className="text-destructive">*</span>}
                      </span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Actions Footer */}
        <div className="border-t border-border p-4 shrink-0 bg-card">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              className="flex-1 gap-2"
              onClick={handleSubmitAppeal}
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
                  Submit Appeal
                </>
              )}
            </Button>
            <Button variant="outline" className="flex-1 gap-2" onClick={handleRequestClinical}>
              <MessageSquare className="size-4" />
              Request Clinical Input
            </Button>
            <Button variant="outline" className="gap-2 text-muted-foreground" onClick={handleCloseSelfPay}>
              <XCircle className="size-4" />
              Close (Self-Pay)
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
