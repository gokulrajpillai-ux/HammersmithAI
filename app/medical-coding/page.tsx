"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { CodingHeader } from "@/components/medical-coding/header"
import { DocumentViewer } from "@/components/medical-coding/document-viewer"
import { CodingSuggestions } from "@/components/medical-coding/coding-suggestions"
import { CodeBasket } from "@/components/medical-coding/code-basket"

export interface CodeSuggestion {
  id: string
  code: string
  codeType: "ICD-10" | "CPT"
  description: string
  confidence: number
  sourcePhrase: string
  status: "pending" | "confirmed" | "rejected" | "modified"
  modifiedCode?: string
}

const initialSuggestions: CodeSuggestion[] = [
  {
    id: "1",
    code: "S82.201A",
    codeType: "ICD-10",
    description: "Unspecified fracture of shaft of right tibia, initial encounter",
    confidence: 94,
    sourcePhrase: "displaced tibial shaft fracture",
    status: "pending",
  },
  {
    id: "2",
    code: "99214",
    codeType: "CPT",
    description: "Office visit, established patient, moderate complexity",
    confidence: 88,
    sourcePhrase: "Follow-up evaluation and management",
    status: "pending",
  },
  {
    id: "3",
    code: "M79.3",
    codeType: "ICD-10",
    description: "Panniculitis, unspecified",
    confidence: 72,
    sourcePhrase: "soft tissue swelling noted",
    status: "pending",
  },
  {
    id: "4",
    code: "Z96.641",
    codeType: "ICD-10",
    description: "Presence of right artificial hip joint",
    confidence: 96,
    sourcePhrase: "history of right hip arthroplasty",
    status: "pending",
  },
  {
    id: "5",
    code: "20680",
    codeType: "CPT",
    description: "Removal of implant; deep",
    confidence: 65,
    sourcePhrase: "hardware removal discussed",
    status: "pending",
  },
]

export default function MedicalCodingPage() {
  const [suggestions, setSuggestions] = useState<CodeSuggestion[]>(initialSuggestions)
  const [selectedPhraseId, setSelectedPhraseId] = useState<string | null>(null)

  const confirmedCodes = suggestions.filter(s => s.status === "confirmed")
  const pendingCount = suggestions.filter(s => s.status === "pending").length

  const handleConfirm = (id: string) => {
    setSuggestions(prev => 
      prev.map(s => s.id === id ? { ...s, status: "confirmed" as const } : s)
    )
  }

  const handleReject = (id: string) => {
    setSuggestions(prev => 
      prev.map(s => s.id === id ? { ...s, status: "rejected" as const } : s)
    )
  }

  const handleModify = (id: string, newCode: string) => {
    setSuggestions(prev => 
      prev.map(s => s.id === id ? { ...s, status: "modified" as const, modifiedCode: newCode } : s)
    )
  }

  const handleRemoveFromBasket = (id: string) => {
    setSuggestions(prev => 
      prev.map(s => s.id === id ? { ...s, status: "pending" as const } : s)
    )
  }

  const handleHighlightPhrase = (id: string | null) => {
    setSelectedPhraseId(id)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <CodingHeader pendingCount={pendingCount} confirmedCount={confirmedCodes.length} />
        
        <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 lg:p-6 overflow-hidden">
          {/* Document Viewer - Left Pane */}
          <div className="w-full lg:w-1/2 flex flex-col min-h-[400px] lg:min-h-0">
            <DocumentViewer 
              selectedPhraseId={selectedPhraseId} 
              suggestions={suggestions}
              onPhraseClick={handleHighlightPhrase}
            />
          </div>
          
          {/* Coding Panel - Right Pane */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4 min-h-[400px] lg:min-h-0">
            <div className="flex-1 overflow-hidden">
              <CodingSuggestions 
                suggestions={suggestions}
                onConfirm={handleConfirm}
                onReject={handleReject}
                onModify={handleModify}
                onHover={handleHighlightPhrase}
                selectedPhraseId={selectedPhraseId}
              />
            </div>
            <CodeBasket 
              confirmedCodes={confirmedCodes} 
              onRemove={handleRemoveFromBasket}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
