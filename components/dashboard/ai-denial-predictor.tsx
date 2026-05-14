"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Sparkles, AlertCircle, ChevronRight, X, User, Building, FileText, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface PredictedClaim {
  id: string
  patientName: string
  claimAmount: string
  payer: string
  probability: number
  riskLevel: "high" | "medium" | "low"
  reason: string
}

const predictedClaims: PredictedClaim[] = [
  {
    id: "CLM-2024-4521",
    patientName: "Rajesh Kumar",
    claimAmount: "₹3,54,250",
    payer: "Star Health Insurance",
    probability: 87,
    riskLevel: "high",
    reason: "Prior authorization not on file",
  },
  {
    id: "CLM-2024-4518",
    patientName: "Priya Sharma",
    claimAmount: "₹2,40,890",
    payer: "ICICI Lombard",
    probability: 72,
    riskLevel: "high",
    reason: "Duplicate claim detected",
  },
  {
    id: "CLM-2024-4515",
    patientName: "Amit Patel",
    claimAmount: "₹1,37,500",
    payer: "HDFC ERGO",
    probability: 54,
    riskLevel: "medium",
    reason: "Coding mismatch - CPT/ICD",
  },
  {
    id: "CLM-2024-4512",
    patientName: "Neha Gupta",
    claimAmount: "₹2,85,200",
    payer: "Max Bupa",
    probability: 41,
    riskLevel: "low",
    reason: "Missing modifier",
  },
]

function getRiskColor(level: string) {
  switch (level) {
    case "high":
      return "bg-destructive/10 text-destructive border-destructive/20"
    case "medium":
      return "bg-warning/10 text-warning border-warning/20"
    case "low":
      return "bg-success/10 text-success border-success/20"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getProbabilityColor(probability: number) {
  if (probability >= 70) return "text-destructive"
  if (probability >= 50) return "text-warning"
  return "text-success"
}

export function AIDenialPredictor() {
  const [selectedClaim, setSelectedClaim] = useState<PredictedClaim | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [isResolving, setIsResolving] = useState(false)

  const handleReview = (claim: PredictedClaim) => {
    setSelectedClaim(claim)
    setSheetOpen(true)
  }

  const handleResolveIssue = () => {
    if (!selectedClaim) return
    setIsResolving(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsResolving(false)
      setSheetOpen(false)
      toast.success("Issue Resolution Started", {
        description: `Claim ${selectedClaim.id} has been queued for review. You'll be notified when resolved.`,
      })
    }, 1500)
  }

  const handleDismissFlag = () => {
    if (!selectedClaim) return
    setSheetOpen(false)
    toast.info("Flag Dismissed", {
      description: `Claim ${selectedClaim.id} flag has been dismissed. The claim will proceed normally.`,
    })
  }

  return (
    <>
      <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="size-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Denial Predictor</CardTitle>
              <CardDescription>Claims at risk of denial based on AI analysis</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
            <AlertCircle className="mr-1 size-3" />
            4 Claims Flagged
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {predictedClaims.map((claim) => (
          <div
            key={claim.id}
            className="group flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-border bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
          >
            <div className="flex-1 min-w-0 space-y-2 sm:space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-card-foreground">{claim.patientName}</span>
                <Badge variant="outline" className={getRiskColor(claim.riskLevel)}>
                  {claim.riskLevel.charAt(0).toUpperCase() + claim.riskLevel.slice(1)} Risk
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span>{claim.id}</span>
                <span className="hidden sm:inline">•</span>
                <span>{claim.payer}</span>
                <span className="hidden sm:inline">•</span>
                <span className="font-medium text-card-foreground">{claim.claimAmount}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="text-primary">Reason:</span> {claim.reason}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className={`text-2xl font-bold ${getProbabilityColor(claim.probability)}`}>
                  {claim.probability}%
                </p>
                <p className="text-xs text-muted-foreground">Denial Risk</p>
              </div>
              <Button size="sm" className="gap-1" onClick={() => handleReview(claim)}>
                Review
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>

    {/* Review Slide-over Panel */}
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        {selectedClaim && (
          <>
            <SheetHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-xl">Review Claim</SheetTitle>
                <Badge variant="outline" className={getRiskColor(selectedClaim.riskLevel)}>
                  {selectedClaim.riskLevel.charAt(0).toUpperCase() + selectedClaim.riskLevel.slice(1)} Risk
                </Badge>
              </div>
              <SheetDescription>
                AI-detected potential denial risk for {selectedClaim.id}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Claim Summary */}
              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <User className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Patient</p>
                    <p className="font-medium">{selectedClaim.patientName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Building className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Payer</p>
                    <p className="font-medium">{selectedClaim.payer}</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground">Claim Amount</p>
                  <p className="font-semibold text-lg">{selectedClaim.claimAmount}</p>
                </div>
              </div>

              {/* Denial Probability */}
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-destructive">Denial Probability</p>
                  <span className={`text-2xl font-bold ${getProbabilityColor(selectedClaim.probability)}`}>
                    {selectedClaim.probability}%
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      selectedClaim.probability >= 70 ? 'bg-destructive' : 
                      selectedClaim.probability >= 50 ? 'bg-warning' : 'bg-success'
                    }`}
                    style={{ width: `${selectedClaim.probability}%` }}
                  />
                </div>
              </div>

              {/* AI Analysis */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="size-4 text-primary" />
                  <p className="text-sm font-medium text-primary">AI Analysis</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Issue Detected</p>
                    <p className="text-sm font-medium text-card-foreground">{selectedClaim.reason}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Recommended Action</p>
                    <p className="text-sm text-card-foreground">
                      {selectedClaim.riskLevel === 'high' 
                        ? 'Immediate review required. Contact payer or update documentation before submission.'
                        : selectedClaim.riskLevel === 'medium'
                        ? 'Review claim details and verify coding accuracy before proceeding.'
                        : 'Minor issue detected. Claim can proceed with monitoring.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions Checklist */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <FileText className="size-4" />
                  Resolution Checklist
                </h4>
                <div className="space-y-2">
                  {[
                    'Verify patient eligibility with payer',
                    'Check prior authorization status',
                    'Review CPT/ICD coding accuracy',
                    'Confirm documentation completeness'
                  ].map((item, idx) => (
                    <label key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer">
                      <input type="checkbox" className="size-4 rounded border-border" />
                      <span className="text-sm">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button 
                  className="flex-1 gap-2" 
                  onClick={handleResolveIssue}
                  disabled={isResolving}
                >
                  {isResolving ? (
                    <>
                      <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Resolving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="size-4" />
                      Resolve Issue
                    </>
                  )}
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleDismissFlag}>
                  Dismiss Flag
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  </>
  )
}
