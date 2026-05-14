"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { PriorAuthHeader } from "@/components/prior-auth/header"
import { AuthQueue } from "@/components/prior-auth/auth-queue"
import { AuthWorkspace } from "@/components/prior-auth/auth-workspace"

export interface AuthRequest {
  id: string
  patientMRN: string
  patientName: string
  payer: string
  procedureCode: string
  procedureDesc: string
  submittedDate: string
  riskScore: "high" | "medium" | "low"
  status: "submitted" | "ai-review" | "documentation" | "sent-to-payer" | "approved" | "denied"
  clinicalSummary: string
  missingDocs: string[]
  policyMatches: { clause: string; match: boolean; description: string }[]
}

const mockRequests: AuthRequest[] = [
  {
    id: "AUTH-2024-1892",
    patientMRN: "MRN-445521",
    patientName: "Arjun Mehta",
    payer: "Star Health Insurance",
    procedureCode: "CPT-27447",
    procedureDesc: "Total Knee Arthroplasty",
    submittedDate: "May 12, 2026",
    riskScore: "high",
    status: "ai-review",
    clinicalSummary: "65-year-old male with severe osteoarthritis of the right knee. Conservative treatment including NSAIDs, physical therapy for 6 months, and corticosteroid injections (3 sessions) have failed to provide adequate pain relief. Patient reports significant functional limitation with ambulation. BMI: 28.4. X-ray shows Grade IV Kellgren-Lawrence changes with complete loss of joint space.",
    missingDocs: ["Physical Therapy Progress Notes", "Recent X-Ray Report"],
    policyMatches: [
      { clause: "Medical Necessity Rule 4.2a", match: true, description: "Failed conservative treatment for 6+ months" },
      { clause: "Documentation Rule 2.1", match: false, description: "Requires imaging within 90 days" },
      { clause: "Clinical Criteria 3.5", match: true, description: "Kellgren-Lawrence Grade III or higher" },
    ],
  },
  {
    id: "AUTH-2024-1891",
    patientMRN: "MRN-445520",
    patientName: "Sunita Reddy",
    payer: "HDFC ERGO",
    procedureCode: "CPT-43239",
    procedureDesc: "Upper GI Endoscopy with Biopsy",
    submittedDate: "May 11, 2026",
    riskScore: "low",
    status: "documentation",
    clinicalSummary: "52-year-old female with persistent dyspepsia and weight loss over 3 months. H. pylori test positive. Family history of gastric cancer. Recommended for diagnostic endoscopy with biopsy.",
    missingDocs: [],
    policyMatches: [
      { clause: "Diagnostic Criteria 1.2", match: true, description: "Alarm symptoms present (weight loss)" },
      { clause: "Age Criteria 1.5", match: true, description: "Patient over 50 with new onset symptoms" },
    ],
  },
  {
    id: "AUTH-2024-1890",
    patientMRN: "MRN-445519",
    patientName: "Vikram Sharma",
    payer: "ICICI Lombard",
    procedureCode: "CPT-70553",
    procedureDesc: "MRI Brain with Contrast",
    submittedDate: "May 10, 2026",
    riskScore: "medium",
    status: "submitted",
    clinicalSummary: "48-year-old male presenting with persistent headaches for 2 weeks, accompanied by visual disturbances. Neurological exam shows papilledema. CT scan inconclusive. MRI recommended for further evaluation.",
    missingDocs: ["CT Scan Report", "Ophthalmology Consultation"],
    policyMatches: [
      { clause: "Medical Necessity 2.3", match: true, description: "Neurological symptoms present" },
      { clause: "Step Therapy 4.1", match: false, description: "CT scan results required first" },
    ],
  },
  {
    id: "AUTH-2024-1889",
    patientMRN: "MRN-445518",
    patientName: "Priya Nair",
    payer: "Max Bupa",
    procedureCode: "CPT-27130",
    procedureDesc: "Total Hip Arthroplasty",
    submittedDate: "May 9, 2026",
    riskScore: "low",
    status: "sent-to-payer",
    clinicalSummary: "70-year-old female with avascular necrosis of the left femoral head. Progressive hip pain limiting mobility. Failed conservative management including physical therapy and NSAIDs for 8 months.",
    missingDocs: [],
    policyMatches: [
      { clause: "Medical Necessity Rule 4.2a", match: true, description: "Failed conservative treatment" },
      { clause: "Documentation Rule 2.1", match: true, description: "Recent imaging on file" },
      { clause: "Clinical Criteria 3.3", match: true, description: "AVN confirmed on MRI" },
    ],
  },
  {
    id: "AUTH-2024-1888",
    patientMRN: "MRN-445517",
    patientName: "Rahul Desai",
    payer: "Bajaj Allianz",
    procedureCode: "CPT-33533",
    procedureDesc: "CABG Single Arterial Graft",
    submittedDate: "May 8, 2026",
    riskScore: "high",
    status: "ai-review",
    clinicalSummary: "58-year-old male with triple vessel coronary artery disease. Recent STEMI managed medically. Angiography shows 90% LAD stenosis, 80% RCA stenosis. EF 45%. Not a candidate for PCI due to lesion complexity.",
    missingDocs: ["Cardiology Clearance Letter", "Anesthesia Risk Assessment"],
    policyMatches: [
      { clause: "Cardiac Surgery Criteria 5.1", match: true, description: "Multi-vessel disease confirmed" },
      { clause: "Documentation 2.4", match: false, description: "Pre-op clearance required" },
    ],
  },
]

export default function PriorAuthPage() {
  const [selectedRequest, setSelectedRequest] = useState<AuthRequest | null>(null)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 md:ml-64">
        <PriorAuthHeader />
        <main className="p-4 md:p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Panel - Auth Queue */}
            <div className="w-full lg:w-[40%]">
              <AuthQueue 
                requests={mockRequests} 
                selectedId={selectedRequest?.id}
                onSelect={setSelectedRequest}
              />
            </div>
            
            {/* Right Panel - Workspace */}
            <div className="w-full lg:w-[60%]">
              <AuthWorkspace request={selectedRequest} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
