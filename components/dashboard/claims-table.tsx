"use client"

import { useState } from "react"
import { toast } from "sonner"
import { MoreHorizontal, Search, Filter, Download, X, Clock, CheckCircle, AlertCircle, FileText, User, Building, Edit, Send } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface Claim {
  id: string
  patientName: string
  payer: string
  amount: string
  status: "Pending" | "Flagged" | "Paid" | "Denied"
  dateSubmitted: string
  reasonCode: string
  aiAnalysis: string
}

interface AuditEvent {
  id: string
  action: string
  user: string
  timestamp: string
  details: string
  type: "created" | "updated" | "flagged" | "approved" | "denied" | "system"
}

const claims: Claim[] = [
  {
    id: "CLM-2024-4525",
    patientName: "Ananya Reddy",
    payer: "Star Health Insurance",
    amount: "₹2,87,500",
    status: "Pending",
    dateSubmitted: "May 12, 2026",
    reasonCode: "N/A",
    aiAnalysis: "Clean claim - high approval likelihood",
  },
  {
    id: "CLM-2024-4521",
    patientName: "Rajesh Kumar",
    payer: "ICICI Lombard",
    amount: "₹3,54,250",
    status: "Flagged",
    dateSubmitted: "May 11, 2026",
    reasonCode: "PR-96",
    aiAnalysis: "Missing prior authorization - recommend resubmission",
  },
  {
    id: "CLM-2024-4518",
    patientName: "Priya Sharma",
    payer: "HDFC ERGO",
    amount: "₹2,40,890",
    status: "Flagged",
    dateSubmitted: "May 10, 2026",
    reasonCode: "CO-18",
    aiAnalysis: "Duplicate claim detected - verify billing history",
  },
  {
    id: "CLM-2024-4515",
    patientName: "Amit Patel",
    payer: "Max Bupa",
    amount: "₹1,37,500",
    status: "Paid",
    dateSubmitted: "May 9, 2026",
    reasonCode: "N/A",
    aiAnalysis: "Processed successfully - payment received",
  },
  {
    id: "CLM-2024-4512",
    patientName: "Neha Gupta",
    payer: "Bajaj Allianz",
    amount: "₹2,85,200",
    status: "Pending",
    dateSubmitted: "May 8, 2026",
    reasonCode: "N/A",
    aiAnalysis: "Minor modifier issue - low denial risk",
  },
  {
    id: "CLM-2024-4509",
    patientName: "Vikram Singh",
    payer: "New India Assurance",
    amount: "₹4,26,700",
    status: "Denied",
    dateSubmitted: "May 7, 2026",
    reasonCode: "CO-4",
    aiAnalysis: "Service not covered - appeal recommended",
  },
]

// Mock audit trail data for each claim
const getAuditTrail = (claimId: string): AuditEvent[] => {
  const baseEvents: AuditEvent[] = [
    {
      id: "1",
      action: "Claim Created",
      user: "System",
      timestamp: "May 7, 2026 09:15 AM",
      details: "Claim submitted via EHR integration",
      type: "created",
    },
    {
      id: "2",
      action: "AI Validation",
      user: "RevCycle AI",
      timestamp: "May 7, 2026 09:16 AM",
      details: "Automated validation completed - 12 checks passed",
      type: "system",
    },
    {
      id: "3",
      action: "Claim Reviewed",
      user: "Dr. Priya Sharma",
      timestamp: "May 8, 2026 11:30 AM",
      details: "Clinical documentation verified",
      type: "approved",
    },
    {
      id: "4",
      action: "Submitted to Payer",
      user: "System",
      timestamp: "May 8, 2026 02:00 PM",
      details: "Electronic submission via EDI 837P",
      type: "system",
    },
    {
      id: "5",
      action: "Acknowledgment Received",
      user: "Payer System",
      timestamp: "May 8, 2026 02:05 PM",
      details: "Claim accepted for processing",
      type: "updated",
    },
  ]

  // Add claim-specific events based on status
  if (claimId === "CLM-2024-4521" || claimId === "CLM-2024-4518") {
    baseEvents.push({
      id: "6",
      action: "AI Flag Raised",
      user: "RevCycle AI",
      timestamp: "May 10, 2026 08:00 AM",
      details: "Potential denial risk detected - review recommended",
      type: "flagged",
    })
  }

  if (claimId === "CLM-2024-4509") {
    baseEvents.push(
      {
        id: "6",
        action: "Claim Denied",
        user: "New India Assurance",
        timestamp: "May 11, 2026 10:00 AM",
        details: "Denial reason: Service not covered under policy",
        type: "denied",
      },
      {
        id: "7",
        action: "Appeal Initiated",
        user: "Rahul Verma",
        timestamp: "May 12, 2026 09:00 AM",
        details: "Appeal documentation prepared",
        type: "updated",
      }
    )
  }

  if (claimId === "CLM-2024-4515") {
    baseEvents.push(
      {
        id: "6",
        action: "Payment Posted",
        user: "Max Bupa",
        timestamp: "May 13, 2026 03:00 PM",
        details: "Full payment received - ₹1,37,500",
        type: "approved",
      }
    )
  }

  return baseEvents
}

function getStatusBadge(status: Claim["status"]) {
  switch (status) {
    case "Paid":
      return <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20">Paid</Badge>
    case "Pending":
      return <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">Pending</Badge>
    case "Flagged":
      return <Badge className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/20">Flagged</Badge>
    case "Denied":
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">Denied</Badge>
  }
}

function getAuditIcon(type: AuditEvent["type"]) {
  switch (type) {
    case "created":
      return <FileText className="size-4 text-primary" />
    case "updated":
      return <Clock className="size-4 text-info" />
    case "flagged":
      return <AlertCircle className="size-4 text-warning" />
    case "approved":
      return <CheckCircle className="size-4 text-success" />
    case "denied":
      return <X className="size-4 text-destructive" />
    case "system":
      return <Building className="size-4 text-muted-foreground" />
  }
}

export function ClaimsTable() {
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isResubmitting, setIsResubmitting] = useState(false)

  const handleClaimClick = (claim: Claim) => {
    setSelectedClaim(claim)
    setSheetOpen(true)
  }

  const handleEditClaim = () => {
    if (!selectedClaim) return
    setIsEditing(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsEditing(false)
      setSheetOpen(false)
      toast.success("Edit Mode Enabled", {
        description: `Claim ${selectedClaim.id} is now open for editing. Changes will be saved automatically.`,
      })
    }, 1000)
  }

  const handleResubmit = () => {
    if (!selectedClaim) return
    setIsResubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsResubmitting(false)
      setSheetOpen(false)
      toast.success("Claim Resubmitted", {
        description: `Claim ${selectedClaim.id} has been resubmitted to ${selectedClaim.payer}. Track status in the Claims tab.`,
      })
    }, 1500)
  }

  const handleVoidClaim = (claim: Claim) => {
    toast.error("Claim Voided", {
      description: `Claim ${claim.id} has been voided and removed from processing.`,
    })
  }

  const handleFilter = () => {
    toast.info("Filter Options", {
      description: "Filter functionality coming soon. Use the search bar to find specific claims.",
    })
  }

  const handleDownload = () => {
    toast.success("Export Started", {
      description: "Your claims data is being exported. Download will start automatically.",
    })
  }

  const auditTrail = selectedClaim ? getAuditTrail(selectedClaim.id) : []

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">Claims Status</CardTitle>
              <CardDescription>Click a row to view full audit trail</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search claims..."
                  className="pl-9 w-full sm:w-64 bg-secondary/50 border-border"
                />
              </div>
              <Button variant="outline" size="icon" className="border-border" onClick={handleFilter}>
                <Filter className="size-4" />
              </Button>
              <Button variant="outline" size="icon" className="border-border" onClick={handleDownload}>
                <Download className="size-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Patient</th>
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Payer</th>
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Amount</th>
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Reason Code</th>
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">AI Analysis</th>
                  <th className="pb-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {claims.map((claim) => (
                  <tr 
                    key={claim.id} 
                    className="group hover:bg-secondary/30 transition-colors cursor-pointer"
                    onClick={() => handleClaimClick(claim)}
                  >
                    <td className="py-4">
                      <div>
                        <p className="font-medium text-card-foreground">{claim.patientName}</p>
                        <p className="text-sm text-muted-foreground">{claim.id}</p>
                      </div>
                    </td>
                    <td className="py-4">
                      <p className="text-sm text-card-foreground">{claim.payer}</p>
                    </td>
                    <td className="py-4">
                      <p className="font-medium text-card-foreground">{claim.amount}</p>
                    </td>
                    <td className="py-4">
                      {getStatusBadge(claim.status)}
                    </td>
                    <td className="py-4">
                      <code className="rounded bg-secondary px-2 py-1 text-xs font-mono text-muted-foreground">
                        {claim.reasonCode}
                      </code>
                    </td>
                    <td className="py-4 max-w-xs">
                      <p className="text-sm text-muted-foreground truncate">{claim.aiAnalysis}</p>
                    </td>
                    <td className="py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleClaimClick(claim)}>View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            toast.success("Edit Mode Enabled", {
                              description: `Claim ${claim.id} is now open for editing.`,
                            })
                          }}>Edit Claim</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            toast.success("Claim Resubmitted", {
                              description: `Claim ${claim.id} has been resubmitted to ${claim.payer}.`,
                            })
                          }}>Resubmit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleVoidClaim(claim)}>Void Claim</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Slide-over Panel */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedClaim && (
            <>
              <SheetHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-xl">{selectedClaim.id}</SheetTitle>
                  {getStatusBadge(selectedClaim.status)}
                </div>
                <SheetDescription>
                  Full claim details and audit trail
                </SheetDescription>
              </SheetHeader>

              {/* Claim Details */}
              <div className="mt-6 space-y-6">
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="font-semibold text-lg">{selectedClaim.amount}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <p className="text-xs text-muted-foreground">Submitted</p>
                      <p className="font-medium">{selectedClaim.dateSubmitted}</p>
                    </div>
                  </div>
                  {selectedClaim.reasonCode !== "N/A" && (
                    <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                      <p className="text-xs text-muted-foreground">Reason Code</p>
                      <code className="font-mono font-medium text-warning">{selectedClaim.reasonCode}</code>
                    </div>
                  )}
                </div>

                {/* AI Analysis */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="size-2 rounded-full bg-primary animate-pulse" />
                    <p className="text-sm font-medium text-primary">AI Analysis</p>
                  </div>
                  <p className="text-sm text-card-foreground">{selectedClaim.aiAnalysis}</p>
                </div>

                {/* Audit Trail */}
                <div>
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Clock className="size-4" />
                    Audit Trail
                  </h3>
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
                    
                    <div className="space-y-4">
                      {auditTrail.map((event, index) => (
                        <div key={event.id} className="relative flex gap-4">
                          <div className="relative z-10 flex size-6 items-center justify-center rounded-full bg-card border border-border">
                            {getAuditIcon(event.type)}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium">{event.action}</p>
                              <p className="text-xs text-muted-foreground whitespace-nowrap">{event.timestamp}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{event.user}</p>
                            <p className="text-sm text-card-foreground/80 mt-1">{event.details}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button 
                    className="flex-1 gap-2" 
                    onClick={handleEditClaim}
                    disabled={isEditing}
                  >
                    {isEditing ? (
                      <>
                        <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Opening...
                      </>
                    ) : (
                      <>
                        <Edit className="size-4" />
                        Edit Claim
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2"
                    onClick={handleResubmit}
                    disabled={isResubmitting}
                  >
                    {isResubmitting ? (
                      <>
                        <span className="size-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />
                        Resubmit
                      </>
                    )}
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
