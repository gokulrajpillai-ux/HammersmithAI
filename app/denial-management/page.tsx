"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DenialHeader } from "@/components/denial-management/header"
import { DenialQueue } from "@/components/denial-management/denial-queue"
import { DenialWorkspace } from "@/components/denial-management/denial-workspace"

export interface DeniedClaim {
  id: string
  patientMrn: string
  patientName: string
  payer: string
  totalCharge: string
  denialCode: string
  denialReason: string
  denialDate: string
  aiPriority: "high" | "medium" | "low"
  recoveryProbability: number
  originalSubmitDate: string
  serviceDate: string
  provider: string
}

const deniedClaims: DeniedClaim[] = [
  {
    id: "CLM-2024-4509",
    patientMrn: "MRN-78542",
    patientName: "Vikram Singh",
    payer: "New India Assurance",
    totalCharge: "₹4,26,700",
    denialCode: "CO-4",
    denialReason: "The procedure code is inconsistent with the modifier used or a required modifier is missing",
    denialDate: "May 7, 2026",
    aiPriority: "high",
    recoveryProbability: 87,
    originalSubmitDate: "April 28, 2026",
    serviceDate: "April 25, 2026",
    provider: "Dr. Meera Iyer",
  },
  {
    id: "CLM-2024-4482",
    patientMrn: "MRN-65231",
    patientName: "Kavitha Nair",
    payer: "ICICI Lombard",
    totalCharge: "₹2,85,400",
    denialCode: "CO-16",
    denialReason: "Claim/service lacks information or has submission/billing error(s)",
    denialDate: "May 5, 2026",
    aiPriority: "high",
    recoveryProbability: 92,
    originalSubmitDate: "April 22, 2026",
    serviceDate: "April 20, 2026",
    provider: "Dr. Arun Kapoor",
  },
  {
    id: "CLM-2024-4455",
    patientMrn: "MRN-89214",
    patientName: "Ravi Menon",
    payer: "Star Health Insurance",
    totalCharge: "₹1,92,500",
    denialCode: "CO-27",
    denialReason: "Expenses incurred after coverage terminated",
    denialDate: "May 3, 2026",
    aiPriority: "low",
    recoveryProbability: 23,
    originalSubmitDate: "April 18, 2026",
    serviceDate: "April 15, 2026",
    provider: "Dr. Priya Sharma",
  },
  {
    id: "CLM-2024-4431",
    patientMrn: "MRN-45678",
    patientName: "Deepa Krishnan",
    payer: "HDFC ERGO",
    totalCharge: "₹3,45,800",
    denialCode: "CO-50",
    denialReason: "These are non-covered services because this is not deemed a medical necessity",
    denialDate: "May 1, 2026",
    aiPriority: "medium",
    recoveryProbability: 68,
    originalSubmitDate: "April 15, 2026",
    serviceDate: "April 12, 2026",
    provider: "Dr. Sanjay Gupta",
  },
  {
    id: "CLM-2024-4398",
    patientMrn: "MRN-32145",
    patientName: "Arjun Reddy",
    payer: "Max Bupa",
    totalCharge: "₹5,12,300",
    denialCode: "PR-1",
    denialReason: "Deductible Amount",
    denialDate: "April 28, 2026",
    aiPriority: "low",
    recoveryProbability: 15,
    originalSubmitDate: "April 10, 2026",
    serviceDate: "April 8, 2026",
    provider: "Dr. Ananya Krishnamurthy",
  },
  {
    id: "CLM-2024-4365",
    patientMrn: "MRN-78954",
    patientName: "Sunita Devi",
    payer: "Bajaj Allianz",
    totalCharge: "₹2,15,600",
    denialCode: "CO-11",
    denialReason: "The diagnosis is inconsistent with the procedure",
    denialDate: "April 25, 2026",
    aiPriority: "high",
    recoveryProbability: 85,
    originalSubmitDate: "April 8, 2026",
    serviceDate: "April 5, 2026",
    provider: "Dr. Rajesh Kumar",
  },
]

export default function DenialManagementPage() {
  const [selectedDenial, setSelectedDenial] = useState<DeniedClaim | null>(null)
  const [workspaceOpen, setWorkspaceOpen] = useState(false)

  const handleSelectDenial = (denial: DeniedClaim) => {
    setSelectedDenial(denial)
    setWorkspaceOpen(true)
  }

  const handleCloseWorkspace = () => {
    setWorkspaceOpen(false)
    setSelectedDenial(null)
  }

  const stats = {
    total: deniedClaims.length,
    highPriority: deniedClaims.filter(d => d.aiPriority === "high").length,
    totalValue: "₹19,78,300",
    avgRecovery: Math.round(deniedClaims.reduce((sum, d) => sum + d.recoveryProbability, 0) / deniedClaims.length),
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <DenialHeader stats={stats} />
        
        <div className="flex-1 p-4 lg:p-6 overflow-hidden">
          <DenialQueue 
            denials={deniedClaims} 
            onSelectDenial={handleSelectDenial}
            selectedDenialId={selectedDenial?.id}
          />
        </div>

        <DenialWorkspace 
          denial={selectedDenial}
          open={workspaceOpen}
          onClose={handleCloseWorkspace}
        />
      </main>
    </div>
  )
}
