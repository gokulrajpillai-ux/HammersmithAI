"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { ClaimsHeader } from "@/components/claims-workspace/header"
import { ClaimsQueue } from "@/components/claims-workspace/claims-queue"
import { AIAnalysisPanel } from "@/components/claims-workspace/ai-analysis-panel"

export interface ClaimData {
  id: string
  patientName: string
  abhaId: string
  tpa: string
  tpaType: "government" | "private"
  status: "Pending" | "In Review" | "Approved" | "Denied" | "Appealed"
  amount: string
  procedureCode: string
  admissionDate: string
  clinicalNotes: string
}

const mockClaims: ClaimData[] = [
  {
    id: "CLM-2026-8901",
    patientName: "Rajesh Kumar",
    abhaId: "91-2345-6789-0123",
    tpa: "PM-JAY",
    tpaType: "government",
    status: "Pending",
    amount: "₹1,25,000",
    procedureCode: "PMJAY-KNEE-001",
    admissionDate: "12 May 2026",
    clinicalNotes: "Patient: Rajesh Kumar, Age: 58, Male\n\nChief Complaint: Right knee pain and difficulty walking for 6 months\n\nHistory of Present Illness (HPI):\nThe patient presents with progressive right knee pain that has worsened over the past 6 months. Pain is described as constant, dull aching with sharp exacerbations during weight-bearing activities. Patient reports morning stiffness lasting >30 minutes. Previous conservative management including physiotherapy and NSAIDs provided minimal relief.\n\nPast Medical History:\n- Type 2 Diabetes Mellitus (controlled on Metformin)\n- Hypertension (controlled on Amlodipine)\n- No known drug allergies\n\nPhysical Examination:\n- Right knee: Moderate effusion, crepitus on movement\n- Range of motion: Flexion 90°, Extension -10°\n- Varus deformity noted\n- Tenderness along medial joint line\n\nRadiological Findings:\nX-ray Right Knee (AP/Lateral):\n- Kellgren-Lawrence Grade IV osteoarthritis\n- Complete loss of medial joint space\n- Large osteophytes at tibial and femoral margins\n- Subchondral sclerosis and cysts present\n\nAssessment & Plan:\n1. Severe tricompartmental osteoarthritis right knee\n2. Recommended: Total Knee Replacement (TKR)\n3. Pre-operative cardiac clearance obtained\n4. Procedure scheduled under PM-JAY coverage"
  },
  {
    id: "CLM-2026-8902",
    patientName: "Priya Sharma",
    abhaId: "91-3456-7890-1234",
    tpa: "Star Health Insurance",
    tpaType: "private",
    status: "In Review",
    amount: "₹2,45,000",
    procedureCode: "CPT-27447",
    admissionDate: "10 May 2026",
    clinicalNotes: "Patient: Priya Sharma, Age: 45, Female\n\nChief Complaint: Severe lower back pain radiating to left leg for 3 months\n\nHistory of Present Illness (HPI):\nPatient reports severe lower back pain with radiculopathy to left lower extremity. Pain rated 8/10, worse with sitting and bending. Associated numbness and tingling in L5-S1 dermatome. Failed 6 weeks of conservative management including physical therapy, epidural steroid injections, and oral medications.\n\nNeurological Examination:\n- Left foot dorsiflexion weakness (4/5)\n- Diminished sensation L5 dermatome\n- Positive straight leg raise at 30°\n- Absent left ankle reflex\n\nMRI Lumbar Spine:\n- Large L4-L5 disc herniation with significant foraminal stenosis\n- Compression of left L5 nerve root\n- Degenerative changes at L3-L4\n\nAssessment & Plan:\n1. L4-L5 disc herniation with radiculopathy\n2. Failed conservative management\n3. Recommended: Microdiscectomy L4-L5\n4. Surgery indicated due to progressive neurological deficit"
  },
  {
    id: "CLM-2026-8903",
    patientName: "Amit Patel",
    abhaId: "91-4567-8901-2345",
    tpa: "ICICI Lombard",
    tpaType: "private",
    status: "Denied",
    amount: "₹3,80,000",
    procedureCode: "CPT-33533",
    admissionDate: "08 May 2026",
    clinicalNotes: "Patient: Amit Patel, Age: 62, Male\n\nChief Complaint: Chest pain on exertion, breathlessness\n\nHistory of Present Illness (HPI):\nPatient presents with Canadian Cardiovascular Society Class III angina. Symptoms have progressed despite optimal medical therapy including dual antiplatelet, statin, beta-blocker, and nitrates. Recent episode of unstable angina requiring hospitalization.\n\nCoronary Angiography Findings:\n- Left Main: 50% stenosis\n- LAD: 90% proximal stenosis, 70% mid stenosis\n- LCx: 85% stenosis\n- RCA: 80% proximal stenosis\n- SYNTAX Score: 28 (Intermediate)\n\nEchocardiography:\n- LVEF: 45%\n- Regional wall motion abnormality in LAD territory\n- No significant valvular disease\n\nAssessment & Plan:\n1. Triple vessel coronary artery disease\n2. SYNTAX score favors surgical revascularization\n3. Recommended: CABG x3 (LIMA-LAD, SVG-OM, SVG-RCA)\n4. Pre-operative optimization ongoing"
  },
  {
    id: "CLM-2026-8904",
    patientName: "Neha Gupta",
    abhaId: "91-5678-9012-3456",
    tpa: "CGHS",
    tpaType: "government",
    status: "Approved",
    amount: "₹85,000",
    procedureCode: "CGHS-CATARACT-001",
    admissionDate: "05 May 2026",
    clinicalNotes: "Patient: Neha Gupta, Age: 68, Female\n\nChief Complaint: Progressive blurring of vision in right eye for 1 year\n\nHistory of Present Illness (HPI):\nPatient reports gradual deterioration of vision in right eye affecting daily activities including reading and driving. No history of trauma, eye surgery, or steroid use.\n\nOphthalmic Examination:\n- Visual Acuity: RE 6/36, LE 6/9\n- IOP: RE 14mmHg, LE 12mmHg\n- Slit Lamp: Grade III nuclear sclerosis RE, Grade I LE\n- Fundus: Normal both eyes\n\nAssessment & Plan:\n1. Mature senile cataract right eye\n2. Recommended: Phacoemulsification with IOL implantation\n3. Standard pre-operative workup completed\n4. Procedure approved under CGHS guidelines"
  }
]

export default function ClaimsWorkspacePage() {
  const [selectedClaim, setSelectedClaim] = useState<ClaimData | null>(null)
  const [deidentifyPII, setDeidentifyPII] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 md:ml-64">
        <ClaimsHeader />
        <div className="p-4 lg:p-6">
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Claims Queue - Left 40% */}
            <div className="lg:col-span-2">
              <ClaimsQueue 
                claims={mockClaims}
                selectedClaim={selectedClaim}
                onSelectClaim={setSelectedClaim}
              />
            </div>
            
            {/* AI Analysis Panel - Right 60% */}
            <div className="lg:col-span-3">
              <AIAnalysisPanel 
                claim={selectedClaim}
                deidentifyPII={deidentifyPII}
                onToggleDeidentify={setDeidentifyPII}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
