"use client"

import { FileText, User, Calendar, Stethoscope } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { CodeSuggestion } from "@/app/medical-coding/page"

interface DocumentViewerProps {
  selectedPhraseId: string | null
  suggestions: CodeSuggestion[]
  onPhraseClick: (id: string | null) => void
}

const physicianNotes = {
  patientInfo: {
    name: "Suresh Venkataraman",
    mrn: "MRN-2026-78542",
    dob: "March 15, 1968",
    dos: "May 12, 2026",
    provider: "Dr. Ananya Krishnamurthy, MD",
  },
  sections: [
    {
      title: "History of Present Illness (HPI)",
      content: [
        { text: "58-year-old male presents for ", highlight: false },
        { text: "Follow-up evaluation and management", highlight: true, phraseId: "2" },
        { text: " of right lower extremity injury sustained 6 weeks ago. Patient reports persistent pain (6/10) localized to the mid-tibial region. ", highlight: false },
        { text: "Displaced tibial shaft fracture", highlight: true, phraseId: "1" },
        { text: " was initially managed with closed reduction and casting. Patient notes improved ambulation with crutches but continues to experience discomfort with weight-bearing activities.", highlight: false },
      ],
    },
    {
      title: "Past Medical History",
      content: [
        { text: "Significant for ", highlight: false },
        { text: "history of right hip arthroplasty", highlight: true, phraseId: "4" },
        { text: " (2019), Type 2 Diabetes Mellitus (well-controlled, HbA1c 6.8%), Hypertension (managed with Lisinopril 10mg daily), and Hyperlipidemia (on Atorvastatin 20mg).", highlight: false },
      ],
    },
    {
      title: "Review of Systems (ROS)",
      content: [
        { text: "Constitutional: Denies fever, chills, or unintentional weight loss.\nMusculoskeletal: Right leg pain as described above. ", highlight: false },
        { text: "Soft tissue swelling noted", highlight: true, phraseId: "3" },
        { text: " around the fracture site. No joint instability reported.\nNeurological: No numbness, tingling, or weakness in the affected extremity.\nAll other systems reviewed and negative.", highlight: false },
      ],
    },
    {
      title: "Physical Examination",
      content: [
        { text: "Vitals: BP 128/82, HR 72, Temp 98.4F, SpO2 98% on RA\nGeneral: Alert, oriented, in no acute distress.\nRight Lower Extremity: Mild edema noted over mid-tibia. Tenderness to palpation at fracture site. ROM of knee and ankle within functional limits. Neurovascular status intact distally. Skin intact, no signs of infection.", highlight: false },
      ],
    },
    {
      title: "Imaging Review",
      content: [
        { text: "X-ray right tibia/fibula (today): Evidence of healing fracture with early callus formation. Alignment maintained. No hardware present from prior procedures.", highlight: false },
      ],
    },
    {
      title: "Assessment & Plan",
      content: [
        { text: "1. Right tibial shaft fracture - healing appropriately. Continue weight-bearing as tolerated with crutch assistance. Physical therapy referral for gait training and strengthening.\n2. ", highlight: false },
        { text: "Hardware removal discussed", highlight: true, phraseId: "5" },
        { text: " with patient regarding retained hardware from previous hip surgery - patient declines at this time, will reassess if symptomatic.\n3. Return to clinic in 6 weeks for repeat imaging and evaluation.\n4. Continue current diabetes and hypertension management.", highlight: false },
      ],
    },
  ],
}

export function DocumentViewer({ selectedPhraseId, suggestions, onPhraseClick }: DocumentViewerProps) {
  const getHighlightClass = (phraseId: string) => {
    const suggestion = suggestions.find(s => s.id === phraseId)
    if (!suggestion) return "bg-primary/20 hover:bg-primary/30"
    
    if (suggestion.status === "confirmed") return "bg-success/20 hover:bg-success/30 line-through decoration-success/50"
    if (suggestion.status === "rejected") return "bg-destructive/10 hover:bg-destructive/20 line-through decoration-destructive/50"
    if (suggestion.status === "modified") return "bg-warning/20 hover:bg-warning/30"
    
    return selectedPhraseId === phraseId 
      ? "bg-primary/30 ring-2 ring-primary/50" 
      : "bg-primary/15 hover:bg-primary/25"
  }

  return (
    <Card className="flex-1 flex flex-col overflow-hidden bg-card border-border">
      <CardHeader className="border-b border-border py-3 px-4 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            Physician Notes
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            NER Highlighting Active
          </Badge>
        </div>
        
        {/* Patient Info Bar */}
        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <User className="size-3.5" />
            <span className="font-medium text-foreground">{physicianNotes.patientInfo.name}</span>
            <span className="text-xs">({physicianNotes.patientInfo.mrn})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            <span>DOS: {physicianNotes.patientInfo.dos}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Stethoscope className="size-3.5" />
            <span>{physicianNotes.patientInfo.provider}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-6">
            {physicianNotes.sections.map((section, idx) => (
              <div key={idx}>
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {section.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {section.content.map((part, partIdx) => (
                    part.highlight ? (
                      <span 
                        key={partIdx}
                        className={`px-1 py-0.5 rounded cursor-pointer transition-all ${getHighlightClass(part.phraseId!)}`}
                        onClick={() => onPhraseClick(part.phraseId!)}
                      >
                        {part.text}
                      </span>
                    ) : (
                      <span key={partIdx}>{part.text}</span>
                    )
                  ))}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
