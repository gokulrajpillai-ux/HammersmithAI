"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  Building,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Home,
  ChevronRight,
  Timer,
  Send,
  FileText,
  User,
  CreditCard,
  HelpCircle,
  Loader2,
  Download,
  Archive,
  ExternalLink,
  Upload,
  CheckCircle2,
  FolderOpen
} from "lucide-react"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import Link from "next/link"
import { createClient, isSupabaseConfigured, DEFAULT_ORG_ID } from "@/lib/supabase"
import type { Claim, TPAQuery } from "@/lib/supabase"

// Mock data for private insurance claims
const mockTPAClaims: Claim[] = [
  {
    id: "tpa-001",
    org_id: DEFAULT_ORG_ID,
    patient_id: "p1",
    package_id: "pkg1",
    hospital_bill_amount: 185000,
    status: "pending",
    admission_date: "2024-01-15",
    clinical_notes: "Patient admitted for laparoscopic cholecystectomy with acute cholecystitis presentation.",
    insurance_provider: "Star Health Insurance",
    policy_number: "SHI-2024-MH-78456",
    pre_auth_status: "info_requested",
    pre_auth_requested_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    tpa_queries: [
      {
        id: "q1",
        query_text: "Please provide pre-operative investigation reports including USG Abdomen and LFT.",
        query_type: "documentation",
        raised_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
        status: "open"
      },
      {
        id: "q2",
        query_text: "Justify medical necessity for emergency admission vs elective procedure.",
        query_type: "medical_necessity",
        raised_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        status: "open"
      }
    ],
    patients: {
      id: "p1",
      first_name: "Amit",
      last_name: "Sharma",
      abha_id: "91-4523-7856-9012"
    },
    medical_packages: {
      id: "pkg1",
      package_code: "GS003A",
      procedure_name: "Laparoscopic Cholecystectomy",
      kasp_rate_2026: 45000
    }
  },
  {
    id: "tpa-002",
    org_id: DEFAULT_ORG_ID,
    patient_id: "p2",
    package_id: "pkg2",
    hospital_bill_amount: 320000,
    status: "approved",
    admission_date: "2024-01-14",
    clinical_notes: "CABG surgery for triple vessel disease with reduced EF.",
    insurance_provider: "ICICI Lombard",
    policy_number: "ICL-2024-DL-45123",
    pre_auth_status: "approved",
    pre_auth_requested_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    tpa_queries: [],
    patients: {
      id: "p2",
      first_name: "Priya",
      last_name: "Patel",
      abha_id: "91-7845-1236-5478"
    },
    medical_packages: {
      id: "pkg2",
      package_code: "CV001B",
      procedure_name: "CABG - Triple Vessel",
      kasp_rate_2026: 175000
    }
  },
  {
    id: "tpa-003",
    org_id: DEFAULT_ORG_ID,
    patient_id: "p3",
    package_id: "pkg3",
    hospital_bill_amount: 95000,
    status: "pending",
    admission_date: "2024-01-16",
    clinical_notes: "Total knee replacement for Grade 4 OA with failed conservative management.",
    insurance_provider: "HDFC Ergo",
    policy_number: "HDE-2024-KA-89745",
    pre_auth_status: "pending",
    pre_auth_requested_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago - URGENT
    tpa_queries: [
      {
        id: "q3",
        query_text: "Submit X-ray evidence of Grade 4 OA and physiotherapy records.",
        query_type: "documentation",
        raised_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        status: "open"
      }
    ],
    patients: {
      id: "p3",
      first_name: "Rajesh",
      last_name: "Kumar",
      abha_id: "91-6547-8923-1456"
    },
    medical_packages: {
      id: "pkg3",
      package_code: "OR002A",
      procedure_name: "Total Knee Replacement",
      kasp_rate_2026: 80000
    }
  },
  {
    id: "tpa-004",
    org_id: DEFAULT_ORG_ID,
    patient_id: "p4",
    package_id: "pkg4",
    hospital_bill_amount: 45000,
    status: "denied",
    admission_date: "2024-01-13",
    clinical_notes: "Appendectomy - open procedure due to adhesions from previous surgery.",
    insurance_provider: "Bajaj Allianz",
    policy_number: "BAL-2024-TN-12369",
    pre_auth_status: "rejected",
    pre_auth_requested_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    tpa_queries: [
      {
        id: "q4",
        query_text: "Claim rejected: Pre-existing condition exclusion applies. Provide evidence of policy coverage for pre-existing conditions.",
        query_type: "other",
        raised_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: "open"
      }
    ],
    patients: {
      id: "p4",
      first_name: "Sunita",
      last_name: "Reddy",
      abha_id: "91-3214-6587-9632"
    },
    medical_packages: {
      id: "pkg4",
      package_code: "GS001A",
      procedure_name: "Appendectomy",
      kasp_rate_2026: 25000
    }
  }
]

export default function TPAManagementPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [draftingQuery, setDraftingQuery] = useState<string | null>(null)
  const [aiResponses, setAiResponses] = useState<Record<string, string>>({})
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [uploadedQueries, setUploadedQueries] = useState<Set<string>>(new Set())
  const [documentArchive, setDocumentArchive] = useState<Array<{
    id: string
    claim_id: string
    query_id: string
    url: string
    created_at: string
    patient_name: string
    insurance_provider: string
  }>>([])
  const [loadingArchive, setLoadingArchive] = useState(false)

  // Update current time every minute for IRDAI timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Fetch claims from Supabase
  useEffect(() => {
    async function fetchClaims() {
      setIsLoading(true)
      
      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient()
          const { data, error } = await supabase
            .from('claims')
            .select(`
              *,
              patients (id, first_name, last_name, abha_id),
              medical_packages (id, package_code, procedure_name, kasp_rate_2026)
            `)
            .eq('org_id', DEFAULT_ORG_ID)
            .not('insurance_provider', 'is', null)
            .order('created_at', { ascending: false })

          if (error) throw error
          
          if (data && data.length > 0) {
            setClaims(data as Claim[])
          } else {
            setClaims(mockTPAClaims)
          }
        } catch (err) {
          toast.error("Failed to fetch claims", {
            description: "Using demo data instead"
          })
          setClaims(mockTPAClaims)
        }
      } else {
        setClaims(mockTPAClaims)
      }
      
      setIsLoading(false)
    }

    fetchClaims()
  }, [])

  // Format currency
  const formatINR = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Calculate hours since pre-auth request
  const getHoursSinceRequest = (requestedAt: string | null | undefined): number => {
    if (!requestedAt) return 0
    const requestTime = new Date(requestedAt).getTime()
    return Math.floor((currentTime - requestTime) / (1000 * 60 * 60))
  }

  // Check if IRDAI 3-hour limit is exceeded
  const isIRDAIUrgent = (claim: Claim): boolean => {
    if (claim.pre_auth_status !== 'pending' && claim.pre_auth_status !== 'info_requested') return false
    const hours = getHoursSinceRequest(claim.pre_auth_requested_at)
    return hours >= 3
  }

  // Get pre-auth status badge
  const getPreAuthBadge = (status: Claim['pre_auth_status']) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"><CheckCircle className="size-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="size-3 mr-1" />Rejected</Badge>
      case 'info_requested':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30"><MessageSquare className="size-3 mr-1" />Info Requested</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Clock className="size-3 mr-1" />Pending</Badge>
      default:
        return <Badge className="bg-muted text-muted-foreground">Unknown</Badge>
    }
  }

  // Get query type icon
  const getQueryTypeIcon = (type: TPAQuery['query_type']) => {
    switch (type) {
      case 'medical_necessity':
        return <FileText className="size-4 text-blue-400" />
      case 'documentation':
        return <FileText className="size-4 text-amber-400" />
      case 'coding':
        return <CreditCard className="size-4 text-purple-400" />
      case 'pricing':
        return <CreditCard className="size-4 text-emerald-400" />
      default:
        return <HelpCircle className="size-4 text-muted-foreground" />
    }
  }

  // Draft AI response for a query
  const draftAIResponse = async (claim: Claim, query: TPAQuery) => {
    setDraftingQuery(query.id)

    try {
      let response = ""

      if (isSupabaseConfigured()) {
        const supabase = createClient()
        
        const { data, error } = await supabase.functions.invoke('analyze-claim', {
          body: {
            clinical_summary_deidentified: claim.clinical_notes,
            org_id: DEFAULT_ORG_ID,
            claim_id: claim.id,
            query_type: query.query_type,
            query_text: query.query_text,
            mode: 'tpa_response'
          }
        })

        if (error) throw error
        
        response = data?.response || generateMockResponse(query)
        
        // Save to database
        await supabase
          .from('claims')
          .update({ ai_response_draft: response })
          .eq('id', claim.id)
          .eq('org_id', DEFAULT_ORG_ID)
      } else {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        response = generateMockResponse(query)
      }

      setAiResponses(prev => ({
        ...prev,
        [query.id]: response
      }))

      toast.success("AI Response Drafted", {
        description: "Professional medical justification generated successfully"
      })
    } catch (err) {
      toast.error("Failed to generate response", {
        description: "Please try again or draft manually"
      })
    } finally {
      setDraftingQuery(null)
    }
  }

  // Generate mock response based on query type
  const generateMockResponse = (query: TPAQuery): string => {
    switch (query.query_type) {
      case 'medical_necessity':
        return `Dear Sir/Madam,

Re: Medical Necessity Justification

This is to certify that the patient's admission was clinically warranted based on the following criteria:

1. Clinical Presentation: The patient presented with acute symptoms requiring immediate intervention as per standard medical protocols.

2. Investigation Findings: Pre-operative investigations confirmed the diagnosis and ruled out contraindications for conservative management.

3. Treatment Rationale: As per IRDAI guidelines and established clinical pathways, surgical intervention was the most appropriate course of action given the patient's condition severity and risk of complications if delayed.

4. Risk Assessment: Delaying treatment would have resulted in disease progression with potential life-threatening complications.

We trust this justification addresses your query. All supporting medical records are attached herewith.

Regards,
Dr. Hammersmith
Chief Medical Officer
Hammersmith AI Clinic`

      case 'documentation':
        return `Dear Claims Team,

Re: Documentation Submission

Please find attached the requested documentation:

1. Pre-operative Investigation Reports
   - USG Abdomen dated [DATE]
   - Complete Blood Count & LFT
   - Chest X-Ray (PA View)

2. Clinical Assessment Notes
   - Admission summary with chief complaints
   - Physical examination findings
   - Provisional and final diagnosis

3. Treatment Records
   - Operative notes
   - Post-operative care instructions
   - Discharge summary

All documents are certified copies from our Medical Records Department. Should you require any additional information, please do not hesitate to contact us.

Regards,
Medical Records Department
Hammersmith AI Clinic`

      default:
        return `Dear Sir/Madam,

Thank you for your query regarding the above-mentioned claim.

We have reviewed the points raised and wish to provide the following clarification:

1. The treatment provided was in accordance with standard medical protocols and IRDAI guidelines.

2. All necessary pre-authorizations were obtained prior to commencing treatment.

3. The billing is as per the agreed tariff rates with your organization.

We trust this addresses your concerns. Please feel free to reach out for any further clarification.

Regards,
Revenue Cycle Management Team
Hammersmith AI Clinic`
    }
  }

  // Fetch document archive for a claim
  const fetchDocumentArchive = async (claimId: string) => {
    if (!isSupabaseConfigured()) return
    
    setLoadingArchive(true)
    try {
      const supabase = createClient()
      
      // List files in the claim's folder
      const { data: files, error } = await supabase.storage
        .from('tpa-documents')
        .list(`claims/${claimId}`, {
          sortBy: { column: 'created_at', order: 'desc' }
        })
      
      if (error) throw error
      
      if (files && files.length > 0) {
        const claim = claims.find(c => c.id === claimId)
        const archiveItems = files.map(file => ({
          id: file.id || file.name,
          claim_id: claimId,
          query_id: file.name.split('_')[1] || '',
          url: supabase.storage.from('tpa-documents').getPublicUrl(`claims/${claimId}/${file.name}`).data.publicUrl,
          created_at: file.created_at || new Date().toISOString(),
          patient_name: `${claim?.patients?.first_name} ${claim?.patients?.last_name}`,
          insurance_provider: claim?.insurance_provider || ''
        }))
        setDocumentArchive(archiveItems)
      } else {
        setDocumentArchive([])
      }
    } catch (err) {
      toast.error("Failed to load archive", {
        description: "Could not fetch document archive"
      })
    } finally {
      setLoadingArchive(false)
    }
  }

  // Generate TPA Response PDF and upload to Supabase Storage
  const generateTPAResponsePDF = async (claim: Claim, query: TPAQuery) => {
    const response = aiResponses[query.id]
    if (!response) {
      toast.error("No AI response available", {
        description: "Please draft an AI response first"
      })
      return
    }

    setGeneratingPDF(query.id)
    setUploadProgress(prev => ({ ...prev, [query.id]: 0 }))

    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const leftMargin = 20
      const rightMargin = 20
      const contentWidth = pageWidth - leftMargin - rightMargin
      let yPos = 15

      // Get current date/time in IST (Kochi timezone)
      const now = new Date()
      const istOptions: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }
      const formattedDateTime = now.toLocaleString('en-IN', istOptions)

      // === LETTERHEAD ===
      // Teal accent bar at top
      doc.setFillColor(0, 150, 136)
      doc.rect(0, 0, pageWidth, 8, 'F')

      yPos = 20

      // Hospital Logo placeholder (circle)
      doc.setFillColor(0, 150, 136)
      doc.circle(leftMargin + 8, yPos + 5, 8, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("H", leftMargin + 5.5, yPos + 8)

      // Hospital Name
      doc.setTextColor(0, 90, 80)
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text("HAMMERSMITH HEALTH AI", leftMargin + 22, yPos + 4)
      
      doc.setTextColor(80, 80, 80)
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text("A Unit of Hammersmith Pharmaceuticals Pvt. Ltd.", leftMargin + 22, yPos + 11)

      // Contact info on right side
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      const rightX = pageWidth - rightMargin
      doc.text("123 Medical Center Road, Kochi, Kerala 682001", rightX, yPos, { align: 'right' })
      doc.text("Tel: +91 484 2345678 | Email: rcm@hammersmithai.com", rightX, yPos + 5, { align: 'right' })
      doc.text("ROHINI ID: HOSP-2024-KL-0847 | CIN: U85110KL2020PTC123456", rightX, yPos + 10, { align: 'right' })

      yPos += 25

      // Divider line
      doc.setDrawColor(0, 150, 136)
      doc.setLineWidth(0.5)
      doc.line(leftMargin, yPos, pageWidth - rightMargin, yPos)

      yPos += 10

      // === DOCUMENT INFO ===
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.text(`Date & Time: ${formattedDateTime} IST`, leftMargin, yPos)
      doc.text(`Ref: TPA-RES-${claim.id.slice(0, 8).toUpperCase()}`, rightX, yPos, { align: 'right' })

      yPos += 8

      // === TITLE ===
      doc.setFillColor(240, 248, 255)
      doc.rect(leftMargin, yPos, contentWidth, 10, 'F')
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(0, 80, 120)
      doc.text("TPA QUERY RESPONSE - MEDICAL JUSTIFICATION", pageWidth / 2, yPos + 7, { align: 'center' })

      yPos += 18

      // === TO SECTION ===
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("To:", leftMargin, yPos)
      doc.setFont("helvetica", "normal")
      doc.text(`${claim.insurance_provider}`, leftMargin + 10, yPos)
      yPos += 5
      doc.text("Claims Processing Department", leftMargin + 10, yPos)

      yPos += 12

      // === PATIENT & POLICY DETAILS TABLE ===
      autoTable(doc, {
        startY: yPos,
        head: [['Patient & Policy Information', '']],
        body: [
          ['Patient Name', `${claim.patients?.first_name} ${claim.patients?.last_name}`],
          ['ABHA ID', claim.patients?.abha_id || 'N/A'],
          ['Policy Number', claim.policy_number || 'N/A'],
          ['Insurance Provider', claim.insurance_provider || 'N/A'],
          ['Admission Date', claim.admission_date || 'N/A'],
          ['Procedure', `${claim.medical_packages?.procedure_name} (${claim.medical_packages?.package_code})`],
          ['Claim Amount', formatINR(claim.hospital_bill_amount)]
        ],
        theme: 'grid',
        headStyles: { 
          fillColor: [0, 150, 136], 
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: { 
          fontSize: 9,
          cellPadding: 3
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 50 },
          1: { cellWidth: contentWidth - 50 }
        },
        margin: { left: leftMargin, right: rightMargin }
      })

      yPos = (doc as any).lastAutoTable.finalY + 10

      // === TPA QUERY SECTION ===
      doc.setFillColor(255, 243, 224)
      doc.rect(leftMargin, yPos, contentWidth, 8, 'F')
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(180, 100, 0)
      doc.text("TPA QUERY", leftMargin + 3, yPos + 5.5)
      yPos += 12

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      
      const queryTypeLabel = query.query_type.replace('_', ' ').toUpperCase()
      doc.setFont("helvetica", "bold")
      doc.text(`Query Type: ${queryTypeLabel}`, leftMargin, yPos)
      doc.setFont("helvetica", "normal")
      doc.text(`Raised on: ${new Date(query.raised_at).toLocaleString('en-IN', istOptions)}`, leftMargin + 80, yPos)
      yPos += 6

      const queryLines = doc.splitTextToSize(query.query_text, contentWidth)
      doc.text(queryLines, leftMargin, yPos)
      yPos += queryLines.length * 4 + 8

      // === AI RESPONSE / CLINICAL RATIONALE ===
      doc.setFillColor(232, 245, 233)
      doc.rect(leftMargin, yPos, contentWidth, 8, 'F')
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(46, 125, 50)
      doc.text("CLINICAL RATIONALE & RESPONSE", leftMargin + 3, yPos + 5.5)
      yPos += 12

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")

      const responseLines = doc.splitTextToSize(response, contentWidth)
      
      // Check if we need a new page
      if (yPos + responseLines.length * 4 > 240) {
        doc.addPage()
        yPos = 20
      }
      
      doc.text(responseLines, leftMargin, yPos)
      yPos += responseLines.length * 4 + 15

      // Check if we need a new page for signature section
      if (yPos > 230) {
        doc.addPage()
        yPos = 20
      }

      // === SIGNATURE SECTION ===
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.3)
      doc.line(leftMargin, yPos, leftMargin + 80, yPos)
      
      yPos += 5
      doc.setFontSize(9)
      doc.setFont("helvetica", "bold")
      doc.text("Treating Physician Signature", leftMargin, yPos)
      
      yPos += 15
      
      // Digital Stamp Placeholder
      doc.setDrawColor(0, 150, 136)
      doc.setLineWidth(1)
      doc.rect(leftMargin, yPos, 50, 25)
      doc.setFontSize(7)
      doc.setTextColor(150, 150, 150)
      doc.text("[Digital Stamp]", leftMargin + 10, yPos + 14)
      
      // Signature details on right
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)
      doc.setFont("helvetica", "bold")
      doc.text("Dr. Hammersmith", leftMargin + 60, yPos + 5)
      doc.setFont("helvetica", "normal")
      doc.text("Chief Medical Officer", leftMargin + 60, yPos + 10)
      doc.text("Hammersmith Health AI", leftMargin + 60, yPos + 15)
      doc.text("Reg. No: KMC/2020/12345", leftMargin + 60, yPos + 20)

      // === COMPLIANCE FOOTER ===
      const footerY = doc.internal.pageSize.getHeight() - 15
      
      doc.setDrawColor(0, 150, 136)
      doc.setLineWidth(0.5)
      doc.line(leftMargin, footerY - 5, pageWidth - rightMargin, footerY - 5)
      
      doc.setFontSize(7)
      doc.setTextColor(100, 100, 100)
      doc.setFont("helvetica", "italic")
      doc.text(
        "Generated by Hammersmith AI Revenue Engine. IRDAI 2026 Compliant Document.",
        pageWidth / 2,
        footerY,
        { align: 'center' }
      )
      doc.text(
        "This document is electronically generated and does not require physical signature for TPA portal submission.",
        pageWidth / 2,
        footerY + 4,
        { align: 'center' }
      )

      // Generate PDF as Blob
      const pdfBlob = doc.output('blob')
      const timestamp = Date.now()
      const fileName = `justification_${timestamp}.pdf`
      const filePath = `claims/${claim.id}/${fileName}`

      // Simulate upload progress
      setUploadProgress(prev => ({ ...prev, [query.id]: 30 }))

      if (isSupabaseConfigured()) {
        const supabase = createClient()
        
        // Upload to Supabase Storage
        setUploadProgress(prev => ({ ...prev, [query.id]: 50 }))
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('tpa-documents')
          .upload(filePath, pdfBlob, {
            contentType: 'application/pdf',
            upsert: true
          })

        if (uploadError) throw uploadError

        setUploadProgress(prev => ({ ...prev, [query.id]: 80 }))

        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('tpa-documents')
          .getPublicUrl(filePath)

        const permanentUrl = urlData.publicUrl

        // Update the claims table with the PDF URL
        const { error: updateError } = await supabase
          .from('claims')
          .update({ 
            justification_pdf_url: permanentUrl,
            ai_response_draft: response
          })
          .eq('id', claim.id)
          .eq('org_id', DEFAULT_ORG_ID)

        if (updateError) {
          console.error("[v0] Failed to update claim with PDF URL:", updateError)
        }

        setUploadProgress(prev => ({ ...prev, [query.id]: 100 }))

        // Mark query as uploaded
        setUploadedQueries(prev => new Set([...prev, query.id]))

        // Refresh archive
        await fetchDocumentArchive(claim.id)

        toast.success("Saved & Ready to Send", {
          description: "PDF uploaded to secure server and linked to claim"
        })
      } else {
        // Fallback: just download locally
        setUploadProgress(prev => ({ ...prev, [query.id]: 100 }))
        const patientName = `${claim.patients?.last_name}_${claim.patients?.first_name}`.replace(/\s+/g, '_')
        doc.save(`TPA_Response_${patientName}_${claim.id.slice(0, 8)}.pdf`)
        
        // Mark as uploaded for demo purposes
        setUploadedQueries(prev => new Set([...prev, query.id]))

        toast.success("PDF Generated", {
          description: "Downloaded locally (Supabase not configured)"
        })
      }
    } catch (err) {
      toast.error("PDF Generation Failed", {
        description: err instanceof Error ? err.message : "Could not generate or upload the PDF. Please try again."
      })
    } finally {
      setGeneratingPDF(null)
      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[query.id]
          return newProgress
        })
      }, 2000)
    }
  }

  // Stats
  const stats = {
    total: claims.length,
    pending: claims.filter(c => c.pre_auth_status === 'pending').length,
    approved: claims.filter(c => c.pre_auth_status === 'approved').length,
    infoRequested: claims.filter(c => c.pre_auth_status === 'info_requested').length,
    urgent: claims.filter(c => isIRDAIUrgent(c)).length
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="p-4 lg:p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-foreground transition-colors">
              <Home className="size-4" />
            </Link>
            <ChevronRight className="size-4" />
            <span className="text-foreground">Private TPA Management</span>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Building className="size-6 text-primary" />
                Cashless Pre-Auth Queue
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage private insurance claims and TPA communications
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="size-4 mr-2" />
                Refresh Queue
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="p-4 lg:p-6 border-b border-border">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-card/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Claims</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-500/10 border-yellow-500/30">
            <CardContent className="p-4">
              <p className="text-xs text-yellow-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardContent className="p-4">
              <p className="text-xs text-amber-400">Info Requested</p>
              <p className="text-2xl font-bold text-amber-400">{stats.infoRequested}</p>
            </CardContent>
          </Card>
          <Card className="bg-emerald-500/10 border-emerald-500/30">
            <CardContent className="p-4">
              <p className="text-xs text-emerald-400">Approved</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.approved}</p>
            </CardContent>
          </Card>
          <Card className={`${stats.urgent > 0 ? 'bg-red-500/10 border-red-500/30 animate-pulse-red' : 'bg-card/50'}`}>
            <CardContent className="p-4">
              <p className={`text-xs ${stats.urgent > 0 ? 'text-red-400' : 'text-muted-foreground'}`}>IRDAI Urgent</p>
              <p className={`text-2xl font-bold ${stats.urgent > 0 ? 'text-red-400' : ''}`}>{stats.urgent}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 lg:p-6">
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Claims Queue */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="size-5 text-primary" />
              Cashless Queue
            </h2>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                {claims.map((claim) => {
                  const hours = getHoursSinceRequest(claim.pre_auth_requested_at)
                  const isUrgent = isIRDAIUrgent(claim)
                  const openQueries = claim.tpa_queries?.filter(q => q.status === 'open').length || 0
                  
                  return (
                    <Card 
                      key={claim.id}
                      className={`cursor-pointer transition-all hover:border-primary/50 ${
                        selectedClaim?.id === claim.id ? 'border-primary bg-primary/5' : ''
                      } ${isUrgent ? 'border-red-500/50' : ''}`}
                      onClick={() => setSelectedClaim(claim)}
                    >
                      <CardContent className="p-4">
                        {/* IRDAI Timer */}
                        {(claim.pre_auth_status === 'pending' || claim.pre_auth_status === 'info_requested') && (
                          <div className={`flex items-center justify-between mb-3 p-2 rounded-lg ${
                            isUrgent 
                              ? 'bg-red-500/10 border border-red-500/30' 
                              : 'bg-muted/50'
                          }`}>
                            <div className="flex items-center gap-2">
                              <Timer className={`size-4 ${isUrgent ? 'text-red-400' : 'text-muted-foreground'}`} />
                              <span className={`text-xs font-medium ${isUrgent ? 'text-red-400' : 'text-muted-foreground'}`}>
                                IRDAI Clock: {hours}h elapsed
                              </span>
                            </div>
                            {isUrgent && (
                              <Badge className="bg-red-500 text-white animate-pulse">
                                <AlertTriangle className="size-3 mr-1" />
                                URGENT: Follow up
                              </Badge>
                            )}
                            {!isUrgent && hours >= 2 && (
                              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                                {3 - hours}h remaining
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="size-4 text-muted-foreground" />
                              <p className="font-medium truncate">
                                {claim.patients?.first_name} {claim.patients?.last_name}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {claim.insurance_provider}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Policy: {claim.policy_number}
                            </p>
                          </div>
                          <div className="text-right">
                            {getPreAuthBadge(claim.pre_auth_status)}
                            <p className="text-sm font-semibold mt-2">
                              {formatINR(claim.hospital_bill_amount)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {claim.medical_packages?.procedure_name}
                          </p>
                          {openQueries > 0 && (
                            <Badge variant="outline" className="text-amber-400 border-amber-400/50">
                              <MessageSquare className="size-3 mr-1" />
                              {openQueries} {openQueries === 1 ? 'Query' : 'Queries'}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Query Details Panel */}
          <div className="lg:col-span-3">
            {selectedClaim ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="size-5 text-primary" />
                        {selectedClaim.insurance_provider}
                      </CardTitle>
                      <CardDescription>
                        Policy: {selectedClaim.policy_number} | Claim ID: {selectedClaim.id.slice(0, 8)}
                      </CardDescription>
                    </div>
                    {getPreAuthBadge(selectedClaim.pre_auth_status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="queries" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="queries">
                        Query Inbox ({selectedClaim.tpa_queries?.filter(q => q.status === 'open').length || 0})
                      </TabsTrigger>
                      <TabsTrigger value="archive" onClick={() => fetchDocumentArchive(selectedClaim.id)}>
                        <Archive className="size-4 mr-1" />
                        Document Archive
                      </TabsTrigger>
                      <TabsTrigger value="details">Claim Details</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="queries" className="mt-4 space-y-4">
                      {selectedClaim.tpa_queries && selectedClaim.tpa_queries.length > 0 ? (
                        selectedClaim.tpa_queries.map((query) => (
                          <Card key={query.id} className="bg-secondary/30">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-muted">
                                  {getQueryTypeIcon(query.query_type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {query.query_type.replace('_', ' ')}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(query.raised_at).toLocaleString('en-IN', { 
                                        dateStyle: 'short', 
                                        timeStyle: 'short' 
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-sm">{query.query_text}</p>
                                  
                                  {/* AI Response */}
                                  {aiResponses[query.id] && (
                                    <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/30">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="size-4 text-primary" />
                                        <span className="text-sm font-semibold text-primary">AI-Generated Response</span>
                                      </div>
                                      <pre className="text-xs whitespace-pre-wrap font-sans">
                                        {aiResponses[query.id]}
                                      </pre>
                                      <div className="flex flex-wrap gap-2 mt-4">
                                        <Button size="sm" className="gap-2">
                                          <Send className="size-4" />
                                          Send to TPA
                                        </Button>
                                        {uploadedQueries.has(query.id) ? (
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            className="gap-2 border-emerald-500 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                                            disabled
                                          >
                                            <CheckCircle2 className="size-4" />
                                            Saved & Ready to Send
                                          </Button>
                                        ) : (
                                          <div className="flex flex-col gap-2">
                                            <Button 
                                              size="sm" 
                                              variant="outline"
                                              className="gap-2 border-primary/50 text-primary hover:bg-primary/10"
                                              onClick={() => generateTPAResponsePDF(selectedClaim, query)}
                                              disabled={generatingPDF === query.id}
                                            >
                                              {generatingPDF === query.id ? (
                                                uploadProgress[query.id] !== undefined && uploadProgress[query.id] < 50 ? (
                                                  <>
                                                    <Loader2 className="size-4 animate-spin" />
                                                    Generating PDF...
                                                  </>
                                                ) : (
                                                  <>
                                                    <Upload className="size-4 animate-pulse" />
                                                    Uploading to Secure Server...
                                                  </>
                                                )
                                              ) : (
                                                <>
                                                  <Download className="size-4" />
                                                  Generate TPA Response PDF
                                                </>
                                              )}
                                            </Button>
                                            {generatingPDF === query.id && uploadProgress[query.id] !== undefined && (
                                              <div className="space-y-1">
                                                <Progress value={uploadProgress[query.id]} className="h-2" />
                                                <p className="text-xs text-muted-foreground text-center">
                                                  {uploadProgress[query.id] < 50 ? 'Generating PDF...' : 
                                                   uploadProgress[query.id] < 80 ? 'Uploading to secure server...' : 
                                                   uploadProgress[query.id] < 100 ? 'Linking to database...' : 'Complete!'}
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                        <Button size="sm" variant="outline">
                                          Edit Response
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Draft AI Response Button */}
                                  {!aiResponses[query.id] && (
                                    <Button 
                                      className="mt-3 gap-2"
                                      size="sm"
                                      onClick={() => draftAIResponse(selectedClaim, query)}
                                      disabled={draftingQuery === query.id}
                                    >
                                      {draftingQuery === query.id ? (
                                        <>
                                          <Loader2 className="size-4 animate-spin" />
                                          Drafting Response...
                                        </>
                                      ) : (
                                        <>
                                          <Sparkles className="size-4" />
                                          Draft AI Response
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <CheckCircle className="size-12 mx-auto mb-4 text-emerald-400" />
                          <p className="font-medium">No Open Queries</p>
                          <p className="text-sm">All TPA queries have been resolved</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="archive" className="mt-4 space-y-4">
                      {loadingArchive ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="size-8 animate-spin text-primary" />
                        </div>
                      ) : documentArchive.length > 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold flex items-center gap-2">
                              <FolderOpen className="size-4 text-primary" />
                              Previously Generated Documents
                            </h3>
                            <Badge variant="outline">
                              {documentArchive.length} {documentArchive.length === 1 ? 'Document' : 'Documents'}
                            </Badge>
                          </div>
                          {documentArchive.map((doc) => (
                            <Card 
                              key={doc.id} 
                              className="bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                              onClick={() => window.open(doc.url, '_blank')}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                      <FileText className="size-5 text-primary" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">TPA Response Justification</p>
                                      <p className="text-xs text-muted-foreground">
                                        Generated: {new Date(doc.created_at).toLocaleString('en-IN', {
                                          dateStyle: 'medium',
                                          timeStyle: 'short',
                                          timeZone: 'Asia/Kolkata'
                                        })} IST
                                      </p>
                                    </div>
                                  </div>
                                  <Button size="sm" variant="ghost" className="gap-2">
                                    <ExternalLink className="size-4" />
                                    Open PDF
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <Archive className="size-12 mx-auto mb-4 opacity-20" />
                          <p className="font-medium">No Documents Yet</p>
                          <p className="text-sm">Generated TPA response PDFs will appear here</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="details" className="mt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-secondary/30">
                          <p className="text-xs text-muted-foreground mb-1">Patient</p>
                          <p className="font-medium">
                            {selectedClaim.patients?.first_name} {selectedClaim.patients?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            ABHA: {selectedClaim.patients?.abha_id}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/30">
                          <p className="text-xs text-muted-foreground mb-1">Admission Date</p>
                          <p className="font-medium">{selectedClaim.admission_date}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/30">
                          <p className="text-xs text-muted-foreground mb-1">Procedure</p>
                          <p className="font-medium">{selectedClaim.medical_packages?.procedure_name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Code: {selectedClaim.medical_packages?.package_code}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/30">
                          <p className="text-xs text-muted-foreground mb-1">Bill Amount</p>
                          <p className="font-medium text-lg">{formatINR(selectedClaim.hospital_bill_amount)}</p>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-secondary/30">
                        <p className="text-xs text-muted-foreground mb-2">Clinical Summary</p>
                        <p className="text-sm">{selectedClaim.clinical_notes}</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center min-h-[400px]">
                <CardContent className="text-center text-muted-foreground py-12">
                  <Building className="size-16 mx-auto mb-4 opacity-20" />
                  <p className="font-medium">Select a Claim</p>
                  <p className="text-sm">Click on a claim from the queue to view TPA queries and details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
