"use client"

import { useState } from "react"
import { Sparkles, Send, Copy, Clock, FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface TPAQueryResolverProps {
  payerName: string
}

const queryTypes = [
  { value: "medical_necessity", label: "Medical Necessity" },
  { value: "length_of_stay", label: "Length of Stay" },
  { value: "pre_auth", label: "Pre-Authorization" },
  { value: "documentation", label: "Missing Documentation" },
  { value: "coding", label: "Coding Query" },
]

const sampleLetter = `Subject: Justification for Extended Length of Stay - Claim #CLM-2024-4521

Dear Claims Review Team,

I am writing to provide clinical justification for the extended length of stay for the above-referenced patient admission at Apollo Hospitals, Chennai.

Patient: Rajesh Kumar (MRN: PAT-2024-12345)
Admission Date: May 8, 2026
Discharge Date: May 14, 2026
Total LOS: 6 days

CLINICAL JUSTIFICATION:

The patient was admitted with acute coronary syndrome requiring emergent cardiac catheterization. Post-procedure, the patient developed:

1. Contrast-induced nephropathy requiring additional monitoring
2. Atrial fibrillation requiring rate control optimization
3. Blood glucose instability requiring endocrinology consultation

Per NABH Clinical Guidelines and established cardiology protocols, each of these complications independently warrants extended observation. The patient's creatinine levels did not stabilize until Day 5 post-procedure.

Supporting documentation attached:
- Daily progress notes
- Lab trends
- Cardiology consultation notes
- Nephrology consultation notes

We respectfully request approval of the full 6-day stay as medically necessary.

Sincerely,
Dr. Priya Sharma, MBBS, MD
Attending Cardiologist`

export function TPAQueryResolver({ payerName }: TPAQueryResolverProps) {
  const [queryType, setQueryType] = useState("")
  const [claimId, setClaimId] = useState("")
  const [generatedLetter, setGeneratedLetter] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = () => {
    if (!queryType) {
      toast.error("Select Query Type", {
        description: "Please select the type of TPA query to respond to"
      })
      return
    }
    setIsGenerating(true)
    setTimeout(() => {
      setGeneratedLetter(sampleLetter)
      setIsGenerating(false)
      toast.success("Letter Generated", {
        description: "AI has drafted a justification letter based on patient records"
      })
    }, 2000)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLetter)
    toast.success("Copied to clipboard")
  }

  const handleSend = () => {
    toast.success("Letter Sent", {
      description: `Justification letter submitted to ${payerName}`
    })
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          TPA Query Resolver
        </CardTitle>
        <CardDescription>
          AI-powered justification letter generator for TPA queries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Query Type Selection */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Query Type</label>
            <Select value={queryType} onValueChange={setQueryType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {queryTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Claim ID (Optional)</label>
            <input
              type="text"
              placeholder="CLM-2024-XXXX"
              value={claimId}
              onChange={(e) => setClaimId(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
            />
          </div>
        </div>

        {/* Generate Button */}
        <Button 
          className="w-full gap-2" 
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Generating Letter...
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              Generate Justification Letter
            </>
          )}
        </Button>

        {/* Generated Letter */}
        {generatedLetter && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">AI-Generated Draft</span>
              </div>
              <Badge variant="outline" className="text-xs">
                <Clock className="size-3 mr-1" />
                Just now
              </Badge>
            </div>
            <Textarea
              value={generatedLetter}
              onChange={(e) => setGeneratedLetter(e.target.value)}
              className="min-h-[200px] font-mono text-xs"
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={handleCopy}>
                <Copy className="size-4" />
                Copy
              </Button>
              <Button size="sm" className="gap-2 flex-1" onClick={handleSend}>
                <Send className="size-4" />
                Send to {payerName}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
