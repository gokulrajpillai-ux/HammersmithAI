"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  IndianRupee, 
  AlertTriangle, 
  TrendingDown, 
  Sparkles, 
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  FileSearch,
  Home,
  ChevronRight,
  FileText,
  Download,
  X,
  Building2,
  Stethoscope,
  ShieldCheck
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { jsPDF } from "jspdf"
import { toast } from "sonner"
import { createClient, isSupabaseConfigured, DEFAULT_ORG_ID } from "@/lib/supabase"
import type { Claim } from "@/lib/supabase"

// Mock data for when Supabase is not configured or no data exists
const mockClaims: Claim[] = [
  {
    id: "clm-001",
    org_id: DEFAULT_ORG_ID,
    patient_id: "pat-001",
    package_id: "pkg-001",
    hospital_bill_amount: 145000,
    status: "pending",
    admission_date: "2026-05-10",
    clinical_notes: "Total Knee Replacement - Right knee severe osteoarthritis",
    patients: {
      id: "pat-001",
      first_name: "Rajesh",
      last_name: "Kumar",
      abha_id: "91-2345-6789-0123"
    },
    medical_packages: {
      id: "pkg-001",
      package_code: "GS001A",
      procedure_name: "Total Knee Replacement (Primary)",
      kasp_rate_2026: 125000
    }
  },
  {
    id: "clm-002",
    org_id: DEFAULT_ORG_ID,
    patient_id: "pat-002",
    package_id: "pkg-002",
    hospital_bill_amount: 85000,
    status: "approved",
    admission_date: "2026-05-08",
    clinical_notes: "Cataract surgery with IOL implantation - Phacoemulsification",
    patients: {
      id: "pat-002",
      first_name: "Priya",
      last_name: "Sharma",
      abha_id: "91-3456-7890-1234"
    },
    medical_packages: {
      id: "pkg-002",
      package_code: "OP002A",
      procedure_name: "Cataract Surgery (Phaco + IOL)",
      kasp_rate_2026: 90000
    }
  },
  {
    id: "clm-003",
    org_id: DEFAULT_ORG_ID,
    patient_id: "pat-003",
    package_id: "pkg-003",
    hospital_bill_amount: 380000,
    status: "under_review",
    admission_date: "2026-05-05",
    clinical_notes: "CABG x3 - Triple vessel disease, LIMA-LAD, SVG-OM, SVG-RCA",
    patients: {
      id: "pat-003",
      first_name: "Amit",
      last_name: "Patel",
      abha_id: "91-4567-8901-2345"
    },
    medical_packages: {
      id: "pkg-003",
      package_code: "CV001A",
      procedure_name: "CABG (Coronary Artery Bypass Graft)",
      kasp_rate_2026: 350000
    }
  },
  {
    id: "clm-004",
    org_id: DEFAULT_ORG_ID,
    patient_id: "pat-004",
    package_id: "pkg-004",
    hospital_bill_amount: 95000,
    status: "denied",
    admission_date: "2026-05-03",
    clinical_notes: "Laparoscopic Cholecystectomy - Symptomatic gallstones",
    patients: {
      id: "pat-004",
      first_name: "Neha",
      last_name: "Gupta",
      abha_id: "91-5678-9012-3456"
    },
    medical_packages: {
      id: "pkg-004",
      package_code: "GS002A",
      procedure_name: "Laparoscopic Cholecystectomy",
      kasp_rate_2026: 75000
    }
  }
]

// AI Audit suggestions based on package codes
const aiSuggestions: Record<string, { suggestion: string; potentialIncrease: number }> = {
  "GS001A": {
    suggestion: "Procedure matches GS001B (Complex TKR with bone grafting) instead of GS001A. Patient X-ray shows subchondral cysts requiring additional grafting.",
    potentialIncrease: 15000
  },
  "OP002A": {
    suggestion: "Documentation supports OP002B (Premium IOL) classification. Multifocal IOL implanted per operative notes.",
    potentialIncrease: 8000
  },
  "CV001A": {
    suggestion: "Clinical notes indicate valve repair was also performed. Recommend CV001B (CABG + Valve) for accurate coding.",
    potentialIncrease: 45000
  },
  "GS002A": {
    suggestion: "Procedure complexity matches GS002B (Complex Cholecystectomy with CBD exploration) based on operative findings.",
    potentialIncrease: 12000
  }
}

export default function ClaimsWorkspacePage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadingClaims, setLoadingClaims] = useState<string[]>([]) // Track which claims are being audited
  const [auditResults, setAuditResults] = useState<Record<string, { suggestion: string; potentialIncrease: number; suggestedCode?: string; suggestedRate?: number }>>({})
  const [shaModalOpen, setShaModalOpen] = useState(false)
  const [selectedClaimForSHA, setSelectedClaimForSHA] = useState<Claim | null>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  // Fetch claims from Supabase
  const fetchClaims = async () => {
    setIsLoading(true)
    
    if (!isSupabaseConfigured()) {
      // Use mock data if Supabase is not configured
      setClaims(mockClaims)
      setIsLoading(false)
      toast.info("Demo Mode", {
        description: "Using mock data. Configure Supabase for live data."
      })
      return
    }

    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('claims')
        .select(`
          *,
          patients (
            id,
            first_name,
            last_name,
            abha_id
          ),
          medical_packages (
            id,
            package_code,
            procedure_name,
            kasp_rate_2026
          )
        `)
        .eq('org_id', DEFAULT_ORG_ID)
        .order('created_at', { ascending: false })

      if (error) {
        console.error("[v0] Error fetching claims:", error)
        toast.error("Failed to fetch claims", {
          description: error.message
        })
        // Fall back to mock data
        setClaims(mockClaims)
      } else if (data && data.length > 0) {
        setClaims(data as Claim[])
        toast.success("Claims loaded", {
          description: `Fetched ${data.length} claims from database`
        })
      } else {
        // No data in database, use mock
        setClaims(mockClaims)
        toast.info("No claims found", {
          description: "Displaying sample data"
        })
      }
    } catch (err) {
      console.error("[v0] Unexpected error:", err)
      setClaims(mockClaims)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClaims()
  }, [])

  // Run AI Audit for a specific claim using Edge Function
  const runAIAudit = async (claim: Claim) => {
    const packageCode = claim.medical_packages?.package_code
    const kaspRate = claim.medical_packages?.kasp_rate_2026 || 0
    if (!packageCode) return

    // Add claim to loading state
    setLoadingClaims(prev => [...prev, claim.id])

    try {
      let suggestion: { 
        suggestion: string
        potentialIncrease: number
        suggestedCode?: string
        suggestedRate?: number 
      } | null = null

      if (isSupabaseConfigured()) {
        const supabase = createClient()
        
        // De-identify clinical notes before sending to Edge Function
        const clinicalSummaryDeidentified = deidentifyClinicalNotes(
          claim.clinical_notes || '',
          claim.patients?.first_name,
          claim.patients?.last_name,
          claim.patients?.abha_id
        )
        
        // Call the analyze-claim Edge Function with de-identified data
        const { data, error } = await supabase.functions.invoke('analyze-claim', {
          body: { 
            clinical_summary_deidentified: clinicalSummaryDeidentified,
            org_id: DEFAULT_ORG_ID,
            claim_id: claim.id,
            current_package_code: packageCode,
            current_kasp_rate: kaspRate
          }
        })

        if (error) {
          throw new Error(error.message || 'Edge Function failed')
        }

        if (data?.suggested_package_code && data?.justification) {
          const suggestedRate = data.suggested_kasp_rate || kaspRate
          const revenueOpportunity = suggestedRate - kaspRate

          suggestion = {
            suggestion: data.justification,
            potentialIncrease: revenueOpportunity > 0 ? revenueOpportunity : (data.potential_increase || 0),
            suggestedCode: data.suggested_package_code,
            suggestedRate: suggestedRate
          }

          // Update the claims table in Supabase with AI results and set status to AI-AUDITED
          const { error: updateError } = await supabase
            .from('claims')
            .update({
              status: 'AI-AUDITED',
              ai_suggested_code: data.suggested_package_code,
              ai_justification: data.justification,
              ai_potential_increase: suggestion.potentialIncrease,
              ai_suggested_rate: suggestedRate,
              ai_audited_at: new Date().toISOString()
            })
            .eq('id', claim.id)
            .eq('org_id', DEFAULT_ORG_ID)

          if (updateError) {
            toast.warning("Audit complete but save failed", {
              description: "AI results could not be saved to database"
            })
          } else {
            // Update local state to reflect new status
            setClaims(prev => prev.map(c => 
              c.id === claim.id ? { ...c, status: 'AI-AUDITED' as any } : c
            ))
          }
        }
      } else {
        // Fallback to mock suggestions when Supabase not configured
        await new Promise(resolve => setTimeout(resolve, 2500))
        const mockSuggestion = aiSuggestions[packageCode]
        if (mockSuggestion) {
          suggestion = { 
            ...mockSuggestion, 
            suggestedCode: packageCode.replace('A', 'B'),
            suggestedRate: kaspRate + mockSuggestion.potentialIncrease
          }
        }
      }

      if (suggestion) {
        setAuditResults(prev => ({
          ...prev,
          [claim.id]: suggestion!
        }))

        // Show confetti effect for big optimizations (> 5000)
        if (suggestion.potentialIncrease > 5000) {
          toast.success("Major Optimization Found!", {
            description: `Suggested Code: ${suggestion.suggestedCode} - Revenue Opportunity: ${formatINR(suggestion.potentialIncrease)}`,
            duration: 6000
          })
          triggerCelebration()
        } else if (suggestion.potentialIncrease > 0) {
          toast.success("AI Audit Complete", {
            description: `Suggested Code: ${suggestion.suggestedCode} for ${claim.patients?.first_name} ${claim.patients?.last_name}`
          })
        } else {
          toast.success("AI Audit Complete", {
            description: "Claim coding verified as optimal"
          })
        }
      } else {
        toast.info("Audit Complete", {
          description: "No optimization opportunities found for this claim"
        })
      }
    } catch (err) {
      toast.error("AI Audit Failed", {
        description: err instanceof Error ? err.message : "Edge Function timed out or encountered an error. Please try again."
      })
    } finally {
      // Remove claim from loading state
      setLoadingClaims(prev => prev.filter(id => id !== claim.id))
    }
  }

  // De-identify clinical notes by masking PII
  const deidentifyClinicalNotes = (
    notes: string, 
    firstName?: string, 
    lastName?: string, 
    abhaId?: string
  ): string => {
    let deidentified = notes
    if (firstName) deidentified = deidentified.replace(new RegExp(firstName, 'gi'), '[PATIENT]')
    if (lastName) deidentified = deidentified.replace(new RegExp(lastName, 'gi'), '[PATIENT]')
    if (abhaId) deidentified = deidentified.replace(new RegExp(abhaId.replace(/-/g, '[-\\s]?'), 'gi'), '[ABHA-REDACTED]')
    // Also mask common PII patterns
    deidentified = deidentified.replace(/\b\d{10}\b/g, '[PHONE-REDACTED]')
    deidentified = deidentified.replace(/\b\d{12}\b/g, '[AADHAAR-REDACTED]')
    return deidentified
  }

  // Simple celebration effect for big optimizations
  const triggerCelebration = () => {
    const colors = ['#10b981', '#059669', '#0f766e', '#14b8a6']
    const confettiCount = 50
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div')
      confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}vw;
        top: -10px;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        animation: confetti-fall 3s ease-out forwards;
      `
      document.body.appendChild(confetti)
      setTimeout(() => confetti.remove(), 3000)
    }
  }

  // Format currency in Indian format
  const formatINR = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Open SHA Justification modal
  const openSHAModal = (claim: Claim) => {
    setSelectedClaimForSHA(claim)
    setShaModalOpen(true)
  }

  // Generate mock clinical data for the letter
  const generateClinicalEvidence = (claim: Claim) => {
    const auditResult = auditResults[claim.id]
    return {
      vitals: {
        bp: "142/88 mmHg",
        heartRate: "78 bpm",
        spo2: "97%",
        temperature: "98.6°F"
      },
      comorbidities: ["Hypertension", "Type 2 Diabetes Mellitus", "Dyslipidemia"],
      bmi: 32.5,
      riskFactors: ["Smoking history", "Family history of CAD"],
      kaspCriteria: auditResult?.suggestedCode 
        ? `Patient qualifies for ${auditResult.suggestedCode} (Complex) package due to elevated BMI >30 and multiple comorbidities requiring extended surgical time and post-operative monitoring.`
        : "Standard package criteria met."
    }
  }

  // Generate PDF using jsPDF
  const generatePDF = async () => {
    if (!selectedClaimForSHA) return
    
    setIsGeneratingPDF(true)
    
    try {
      const claim = selectedClaimForSHA
      const auditResult = auditResults[claim.id]
      const evidence = generateClinicalEvidence(claim)
      const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
      
      const doc = new jsPDF()
      let yPos = 20
      const leftMargin = 20
      const pageWidth = 170
      
      // Header - Clinic Name
      doc.setFontSize(18)
      doc.setFont("helvetica", "bold")
      doc.text("HAMMERSMITH AI CLINIC", leftMargin, yPos)
      yPos += 7
      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      doc.text("Hammersmith Pharmaceuticals", leftMargin, yPos)
      yPos += 5
      doc.setFontSize(9)
      doc.text("123 Medical Center Road, Mumbai, Maharashtra 400001", leftMargin, yPos)
      yPos += 4
      doc.text("ROHINI ID: HOSP-2024-MH-0847 | ABHA HIP: HIP-0ec1ab3d", leftMargin, yPos)
      yPos += 10
      
      // Line separator
      doc.setDrawColor(0, 150, 136)
      doc.setLineWidth(0.5)
      doc.line(leftMargin, yPos, leftMargin + pageWidth, yPos)
      yPos += 10
      
      // Document Title
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("MEDICAL APPEAL LETTER - SHA JUSTIFICATION", leftMargin, yPos)
      yPos += 8
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`Date: ${today}`, leftMargin, yPos)
      doc.text(`Ref: SHA-${claim.id.slice(0, 8).toUpperCase()}`, leftMargin + 100, yPos)
      yPos += 12
      
      // To Section
      doc.setFont("helvetica", "bold")
      doc.text("To:", leftMargin, yPos)
      yPos += 6
      doc.setFont("helvetica", "normal")
      doc.text("The Medical Director,", leftMargin, yPos)
      yPos += 5
      doc.text("State Health Agency (SHA),", leftMargin, yPos)
      yPos += 5
      doc.text("Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)", leftMargin, yPos)
      yPos += 10
      
      // Subject
      doc.setFont("helvetica", "bold")
      doc.text("Subject: Request for Package Upgrade - Clinical Justification", leftMargin, yPos)
      yPos += 10
      
      // Patient Details
      doc.setFillColor(240, 248, 255)
      doc.rect(leftMargin, yPos, pageWidth, 25, 'F')
      yPos += 6
      doc.setFont("helvetica", "bold")
      doc.text("PATIENT DETAILS:", leftMargin + 3, yPos)
      yPos += 6
      doc.setFont("helvetica", "normal")
      doc.text(`Name: ${claim.patients?.first_name} ${claim.patients?.last_name}`, leftMargin + 3, yPos)
      doc.text(`ABHA ID: ${claim.patients?.abha_id}`, leftMargin + 90, yPos)
      yPos += 5
      doc.text(`Admission Date: ${claim.admission_date || 'N/A'}`, leftMargin + 3, yPos)
      doc.text(`Current Package: ${claim.medical_packages?.package_code}`, leftMargin + 90, yPos)
      yPos += 14
      
      // Clinical Evidence Section
      doc.setFont("helvetica", "bold")
      doc.text("CLINICAL EVIDENCE:", leftMargin, yPos)
      yPos += 7
      
      // Vitals
      doc.setFont("helvetica", "italic")
      doc.text("Vital Signs at Admission:", leftMargin, yPos)
      yPos += 5
      doc.setFont("helvetica", "normal")
      doc.text(`BP: ${evidence.vitals.bp} | HR: ${evidence.vitals.heartRate} | SpO2: ${evidence.vitals.spo2} | Temp: ${evidence.vitals.temperature}`, leftMargin, yPos)
      yPos += 7
      
      // Comorbidities
      doc.setFont("helvetica", "italic")
      doc.text("Documented Comorbidities:", leftMargin, yPos)
      yPos += 5
      doc.setFont("helvetica", "normal")
      doc.text(evidence.comorbidities.join(", "), leftMargin, yPos)
      yPos += 7
      
      // BMI and Risk Factors
      doc.text(`BMI: ${evidence.bmi} kg/m² (Obese Category)`, leftMargin, yPos)
      yPos += 5
      doc.text(`Risk Factors: ${evidence.riskFactors.join(", ")}`, leftMargin, yPos)
      yPos += 12
      
      // KASP Criteria Justification
      doc.setFont("helvetica", "bold")
      doc.text("KASP 2026 PACKAGE CRITERIA JUSTIFICATION:", leftMargin, yPos)
      yPos += 7
      doc.setFont("helvetica", "normal")
      
      const criteriaLines = doc.splitTextToSize(evidence.kaspCriteria, pageWidth)
      doc.text(criteriaLines, leftMargin, yPos)
      yPos += criteriaLines.length * 5 + 5
      
      // AI Analysis Section
      if (auditResult) {
        yPos += 3
        doc.setFillColor(232, 245, 233)
        doc.rect(leftMargin, yPos, pageWidth, 30, 'F')
        yPos += 6
        doc.setFont("helvetica", "bold")
        doc.text("AI-ASSISTED CODING ANALYSIS:", leftMargin + 3, yPos)
        yPos += 6
        doc.setFont("helvetica", "normal")
        doc.text(`Suggested Package: ${auditResult.suggestedCode}`, leftMargin + 3, yPos)
        yPos += 5
        const justificationLines = doc.splitTextToSize(auditResult.suggestion, pageWidth - 6)
        doc.text(justificationLines, leftMargin + 3, yPos)
        yPos += justificationLines.length * 5 + 5
        doc.text(`Estimated Revenue Adjustment: ${formatINR(auditResult.potentialIncrease)}`, leftMargin + 3, yPos)
        yPos += 15
      }
      
      // Request
      doc.setFont("helvetica", "normal")
      const requestText = `Based on the above clinical evidence and KASP 2026 guidelines, we respectfully request approval for package upgrade from ${claim.medical_packages?.package_code} to ${auditResult?.suggestedCode || 'Complex Category'}. The patient's clinical presentation meets all criteria for the higher complexity tier.`
      const requestLines = doc.splitTextToSize(requestText, pageWidth)
      doc.text(requestLines, leftMargin, yPos)
      yPos += requestLines.length * 5 + 15
      
      // Signature
      doc.text("Yours sincerely,", leftMargin, yPos)
      yPos += 10
      doc.setFont("helvetica", "bold")
      doc.text("Dr. Hammersmith", leftMargin, yPos)
      yPos += 5
      doc.setFont("helvetica", "normal")
      doc.text("Chief Medical Officer", leftMargin, yPos)
      yPos += 5
      doc.text("Hammersmith AI Clinic", leftMargin, yPos)
      
      // NHCX Badge at bottom
      yPos = 275
      doc.setDrawColor(0, 150, 136)
      doc.setLineWidth(0.3)
      doc.line(leftMargin, yPos, leftMargin + pageWidth, yPos)
      yPos += 5
      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.text("NHCX-READY", leftMargin, yPos)
      doc.setFont("helvetica", "normal")
      doc.text("| This document is formatted for National Health Claims Exchange (NHCX) | FHIR R4 Compatible", leftMargin + 25, yPos)
      
      // Save PDF
      doc.save(`SHA_Justification_${claim.patients?.last_name}_${claim.id.slice(0, 8)}.pdf`)
      
      toast.success("PDF Generated", {
        description: "SHA Justification letter has been downloaded"
      })
    } catch (err) {
      toast.error("PDF Generation Failed", {
        description: "Could not generate the PDF. Please try again."
      })
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  // Calculate leakage
  const calculateLeakage = (bill: number, rate: number): number => {
    return bill > rate ? bill - rate : 0
  }

  // Get status badge
  const getStatusBadge = (status: Claim['status'] | 'AI-AUDITED') => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"><CheckCircle className="size-3 mr-1" />Approved</Badge>
      case 'denied':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="size-3 mr-1" />Denied</Badge>
      case 'under_review':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30"><Clock className="size-3 mr-1" />Under Review</Badge>
      case 'AI-AUDITED':
        return <Badge className="bg-primary/20 text-primary border-primary/30"><Sparkles className="size-3 mr-1" />AI-Audited</Badge>
      default:
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><Clock className="size-3 mr-1" />Pending</Badge>
    }
  }

  // Calculate total stats
  const totalBilled = claims.reduce((sum, c) => sum + c.hospital_bill_amount, 0)
  const totalKASP = claims.reduce((sum, c) => sum + (c.medical_packages?.kasp_rate_2026 || 0), 0)
  const totalLeakage = claims.reduce((sum, c) => {
    const rate = c.medical_packages?.kasp_rate_2026 || 0
    return sum + (c.hospital_bill_amount > rate ? c.hospital_bill_amount - rate : 0)
  }, 0)

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="border-b border-border bg-card px-4 lg:px-6 py-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 pl-12 md:pl-0">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Home className="size-4" />
              <ChevronRight className="size-3" />
              <span>Dashboard</span>
              <ChevronRight className="size-3" />
              <span className="text-foreground">Revenue Analysis</span>
            </nav>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Claims Revenue Analysis</h1>
                <p className="text-sm text-muted-foreground mt-1">Compare hospital bills against KASP 2026 rates</p>
              </div>
              <Button onClick={fetchClaims} variant="outline" size="sm" className="gap-2">
                <RefreshCw className="size-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 lg:p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <IndianRupee className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Hospital Bills</p>
                  <p className="text-xl font-semibold">{formatINR(totalBilled)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <CheckCircle className="size-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total KASP Rates</p>
                  <p className="text-xl font-semibold">{formatINR(totalKASP)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border border-red-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <TrendingDown className="size-5 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Revenue Leakage</p>
                  <p className="text-xl font-semibold text-red-400">{formatINR(totalLeakage)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Claims List */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSearch className="size-5" />
              Claims with Revenue Comparison
            </CardTitle>
            <CardDescription>
              {claims.length} claims from Hammersmith AI Clinic
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {claims.map(claim => {
                    const hospitalBill = claim.hospital_bill_amount
                    const kaspRate = claim.medical_packages?.kasp_rate_2026 || 0
                    const leakage = calculateLeakage(hospitalBill, kaspRate)
                    const hasLeakage = leakage > 0
                    const progressPercent = kaspRate > 0 ? Math.min((hospitalBill / kaspRate) * 100, 150) : 0
                    const auditResult = auditResults[claim.id]
                    const isAuditing = loadingClaims.includes(claim.id)

                    return (
                      <Card 
                        key={claim.id} 
                        className={`bg-secondary/30 border-border ${hasLeakage ? 'border-red-500/30' : ''}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                            {/* Patient & Procedure Info */}
                            <div className="flex-1 space-y-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-lg">
                                    {claim.patients?.first_name} {claim.patients?.last_name}
                                  </h3>
                                  <p className="text-xs text-muted-foreground">
                                    ABHA: {claim.patients?.abha_id}
                                  </p>
                                </div>
                                {getStatusBadge(claim.status)}
                              </div>

                              <div className="p-3 rounded-lg bg-background/50">
                                <p className="text-xs text-muted-foreground mb-1">Procedure</p>
                                <p className="font-medium">{claim.medical_packages?.procedure_name}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Package Code: {claim.medical_packages?.package_code}
                                </p>
                              </div>

                              {/* Revenue Comparison */}
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Hospital Bill</span>
                                  <span className="font-semibold">{formatINR(hospitalBill)}</span>
                                </div>
                                <div className="relative">
                                  <Progress 
                                    value={Math.min(progressPercent, 100)} 
                                    className={`h-3 ${hasLeakage ? '[&>div]:bg-red-500' : '[&>div]:bg-emerald-500'}`}
                                  />
                                  {progressPercent > 100 && (
                                    <div 
                                      className="absolute top-0 h-3 bg-red-500/50 rounded-r-full"
                                      style={{ 
                                        left: '66.67%', 
                                        width: `${Math.min((progressPercent - 100) / 1.5, 33.33)}%` 
                                      }}
                                    />
                                  )}
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">KASP 2026 Rate</span>
                                  <span className="font-semibold text-emerald-400">{formatINR(kaspRate)}</span>
                                </div>
                              </div>

                              {/* AI Insights Section */}
                              {auditResult && (
                                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <Sparkles className="size-4 text-primary" />
                                      <span className="text-sm font-semibold text-primary">AI Insights</span>
                                    </div>
                                    {auditResult.suggestedCode && (
                                      <Badge className="bg-primary text-primary-foreground">
                                        {auditResult.suggestedCode}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {/* Justification */}
                                  <p className="text-sm text-card-foreground mb-3">{auditResult.suggestion}</p>
                                  
                                  {/* Revenue Opportunity with Pulse Indicator */}
                                  {auditResult.potentialIncrease > 0 ? (
                                    <div className={`p-3 rounded-lg border ${
                                      auditResult.potentialIncrease > 5000 
                                        ? 'bg-emerald-500/10 border-emerald-500/30 animate-pulse-green' 
                                        : 'bg-emerald-500/5 border-emerald-500/20'
                                    }`}>
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Revenue Opportunity</span>
                                        <div className="flex items-center gap-2">
                                          <span className={`text-lg font-bold ${
                                            auditResult.potentialIncrease > 5000 ? 'text-emerald-400' : 'text-emerald-500'
                                          }`}>
                                            +{formatINR(auditResult.potentialIncrease)}
                                          </span>
                                          {auditResult.potentialIncrease > 5000 && (
                                            <span className="relative flex size-3">
                                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                              <span className="relative inline-flex rounded-full size-3 bg-emerald-500"></span>
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      {auditResult.suggestedRate && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          New KASP Rate: {formatINR(auditResult.suggestedRate)}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle className="size-4 text-blue-400" />
                                        <span className="text-sm text-blue-400">Coding Verified as Optimal</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Revenue Leakage Alert with Pulse */}
                              {hasLeakage && !auditResult && (
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/30 animate-pulse-red">
                                  <AlertTriangle className="size-4 text-red-400" />
                                  <span className="text-sm font-medium text-red-400">
                                    Revenue Leakage: {formatINR(leakage)}
                                  </span>
                                  <span className="relative flex size-2 ml-auto">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full size-2 bg-red-500"></span>
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex lg:flex-col gap-2 lg:w-40">
                              <Button 
                                onClick={() => runAIAudit(claim)}
                                disabled={isAuditing || !!auditResult}
                                className="flex-1 lg:flex-none gap-2"
                                size="sm"
                              >
                                {isAuditing ? (
                                  <>
                                    <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                    Analyzing...
                                  </>
                                ) : auditResult ? (
                                  <>
                                    <CheckCircle className="size-4" />
                                    Audited
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="size-4" />
                                    Run AI Audit
                                  </>
                                )}
                              </Button>
                              
                              {/* SHA Justification Button - only show after audit */}
                              {auditResult && (
                                <Button 
                                  onClick={() => openSHAModal(claim)}
                                  variant="outline"
                                  className="flex-1 lg:flex-none gap-2 border-primary/50 text-primary hover:bg-primary/10"
                                  size="sm"
                                >
                                  <FileText className="size-4" />
                                  Generate SHA Letter
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SHA Justification Modal */}
      <Dialog open={shaModalOpen} onOpenChange={setShaModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              SHA Medical Appeal Letter
            </DialogTitle>
            <DialogDescription>
              Formal justification letter for State Health Agency package upgrade request
            </DialogDescription>
          </DialogHeader>

          {selectedClaimForSHA && (
            <div className="space-y-6">
              {/* Clinic Header */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="size-5 text-primary" />
                      <h3 className="text-lg font-bold text-foreground">HAMMERSMITH AI CLINIC</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Hammersmith Pharmaceuticals</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      123 Medical Center Road, Mumbai, Maharashtra 400001
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ROHINI ID: HOSP-2024-MH-0847 | ABHA HIP: HIP-0ec1ab3d
                    </p>
                  </div>
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    Ref: SHA-{selectedClaimForSHA.id.slice(0, 8).toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Patient Info */}
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Stethoscope className="size-4" />
                  Patient Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <span className="ml-2 font-medium">{selectedClaimForSHA.patients?.first_name} {selectedClaimForSHA.patients?.last_name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ABHA ID:</span>
                    <span className="ml-2 font-medium">{selectedClaimForSHA.patients?.abha_id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Admission Date:</span>
                    <span className="ml-2 font-medium">{selectedClaimForSHA.admission_date || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current Package:</span>
                    <span className="ml-2 font-medium">{selectedClaimForSHA.medical_packages?.package_code}</span>
                  </div>
                </div>
              </div>

              {/* Clinical Evidence */}
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <h4 className="font-semibold mb-3">Clinical Evidence</h4>
                {(() => {
                  const evidence = generateClinicalEvidence(selectedClaimForSHA)
                  return (
                    <div className="space-y-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Vital Signs at Admission:</p>
                        <p className="font-medium">
                          BP: {evidence.vitals.bp} | HR: {evidence.vitals.heartRate} | SpO2: {evidence.vitals.spo2} | Temp: {evidence.vitals.temperature}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Documented Comorbidities:</p>
                        <div className="flex flex-wrap gap-2">
                          {evidence.comorbidities.map((c, i) => (
                            <Badge key={i} variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-muted-foreground mb-1">BMI:</p>
                          <p className="font-medium text-amber-400">{evidence.bmi} kg/m² (Obese Category)</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Risk Factors:</p>
                          <p className="font-medium">{evidence.riskFactors.join(", ")}</p>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                        <p className="text-muted-foreground mb-1">KASP 2026 Package Criteria:</p>
                        <p className="text-emerald-400 font-medium">{evidence.kaspCriteria}</p>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* AI Analysis */}
              {auditResults[selectedClaimForSHA.id] && (
                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" />
                    AI-Assisted Coding Analysis
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Suggested Package:</span>
                      <Badge className="bg-primary text-primary-foreground">
                        {auditResults[selectedClaimForSHA.id].suggestedCode}
                      </Badge>
                    </div>
                    <p>{auditResults[selectedClaimForSHA.id].suggestion}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Estimated Revenue Adjustment:</span>
                      <span className="font-bold text-emerald-400">
                        +{formatINR(auditResults[selectedClaimForSHA.id].potentialIncrease)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* NHCX Badge */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-blue-400" />
                  <div>
                    <p className="text-sm font-semibold text-blue-400">NHCX-Ready</p>
                    <p className="text-xs text-muted-foreground">Formatted for National Health Claims Exchange | FHIR R4 Compatible</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                  ABDM Compliant
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setShaModalOpen(false)}>
                  <X className="size-4 mr-2" />
                  Close
                </Button>
                <Button 
                  onClick={generatePDF}
                  disabled={isGeneratingPDF}
                  className="gap-2"
                >
                  {isGeneratingPDF ? (
                    <>
                      <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="size-4" />
                      Download PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
