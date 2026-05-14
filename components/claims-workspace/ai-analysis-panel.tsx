"use client"

import { useState } from "react"
import { 
  Brain, 
  Eye, 
  EyeOff, 
  FileText, 
  IndianRupee, 
  AlertTriangle, 
  CheckCircle,
  Sparkles,
  Send,
  Calculator,
  Scale
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import type { ClaimData } from "@/app/dashboard/claims/page"

interface AIAnalysisPanelProps {
  claim: ClaimData | null
  deidentifyPII: boolean
  onToggleDeidentify: (value: boolean) => void
}

// PM-JAY package rates (mock data)
const pmjayRates: Record<string, { name: string; rate: number }> = {
  "PMJAY-KNEE-001": { name: "Total Knee Replacement (Unilateral)", rate: 80000 },
  "CPT-27447": { name: "Arthroplasty, knee, condyle and plateau", rate: 175000 },
  "CPT-33533": { name: "CABG, arterial, single", rate: 250000 },
  "CGHS-CATARACT-001": { name: "Phacoemulsification with IOL", rate: 30000 },
}

function deidentifyText(text: string, enabled: boolean): string {
  if (!enabled) return text
  
  // Replace patient names with [PATIENT]
  let deidentified = text.replace(/Patient:\s*[\w\s]+,/g, "Patient: [REDACTED],")
  // Replace ABHA IDs
  deidentified = deidentified.replace(/\d{2}-\d{4}-\d{4}-\d{4}/g, "[ABHA-REDACTED]")
  // Replace ages
  deidentified = deidentified.replace(/Age:\s*\d+/g, "Age: [XX]")
  // Replace names in text
  deidentified = deidentified.replace(/Rajesh Kumar|Priya Sharma|Amit Patel|Neha Gupta/g, "[PATIENT NAME]")
  
  return deidentified
}

export function AIAnalysisPanel({ claim, deidentifyPII, onToggleDeidentify }: AIAnalysisPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGeneratingAppeal, setIsGeneratingAppeal] = useState(false)
  const [appealLetter, setAppealLetter] = useState("")

  if (!claim) {
    return (
      <Card className="bg-card border-border h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="size-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Brain className="size-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Select a Claim to Analyze</p>
            <p className="text-sm text-muted-foreground">Choose a claim from the queue to view AI analysis</p>
          </div>
        </div>
      </Card>
    )
  }

  const packageRate = pmjayRates[claim.procedureCode]
  const claimAmount = parseInt(claim.amount.replace(/[₹,]/g, ""))
  const rateDiscrepancy = packageRate ? claimAmount - packageRate.rate : 0
  const hasDiscrepancy = rateDiscrepancy > 0

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    toast.info("AI Analysis Started", {
      description: deidentifyPII 
        ? "Analyzing with PII de-identified for compliance"
        : "Analyzing clinical notes..."
    })
    setTimeout(() => {
      setIsAnalyzing(false)
      toast.success("Analysis Complete", {
        description: "AI has identified key findings and recommendations"
      })
    }, 2000)
  }

  const handleGenerateAppeal = () => {
    setIsGeneratingAppeal(true)
    toast.info("Generating Appeal Letter", {
      description: "AI is drafting a medical necessity justification..."
    })
    
    setTimeout(() => {
      setIsGeneratingAppeal(false)
      setAppealLetter(`APPEAL FOR MEDICAL NECESSITY

Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
Claim ID: ${claim.id}
Patient ABHA: ${deidentifyPII ? '[REDACTED]' : claim.abhaId}
TPA: ${claim.tpa}
Procedure: ${claim.procedureCode}
Amount: ${claim.amount}

To,
The Medical Director
${claim.tpa}

Subject: Appeal for Denial of Claim ${claim.id} - Medical Necessity Justification

Dear Sir/Madam,

We are writing to formally appeal the denial of the above-referenced claim for ${deidentifyPII ? '[PATIENT]' : claim.patientName}. After careful review of the clinical documentation, we believe this procedure meets all criteria for medical necessity under your policy guidelines.

CLINICAL JUSTIFICATION:

1. DIAGNOSIS: The patient presented with documented clinical findings that clearly indicate the need for the prescribed procedure.

2. CONSERVATIVE TREATMENT FAILURE: As documented in the clinical notes, the patient underwent adequate conservative management which failed to provide relief, meeting the standard criteria for surgical intervention.

3. OBJECTIVE FINDINGS: Diagnostic studies (imaging/lab work) demonstrate clear pathology that supports the medical necessity of this procedure.

4. GUIDELINE COMPLIANCE: This treatment aligns with current clinical practice guidelines and is the standard of care for this condition.

5. QUALITY OF LIFE IMPACT: Without this intervention, the patient faces significant functional impairment affecting their daily living activities.

REQUESTED ACTION:
We respectfully request that ${claim.tpa} reconsider this denial and approve coverage for this medically necessary procedure. All supporting documentation is attached for your review.

We are available to discuss this case further or provide additional clinical information as needed.

Respectfully submitted,

[Treating Physician Name]
[Hospital Name]
[ABDM Registered Facility]

---
Generated by AI Claims Assistant
Compliant with IRDAI Guidelines & ABDM Standards`)
      
      toast.success("Appeal Letter Generated", {
        description: "Review and customize before submission"
      })
    }, 2500)
  }

  return (
    <div className="space-y-4">
      {/* De-identify Toggle */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {deidentifyPII ? (
                <EyeOff className="size-5 text-teal-500" />
              ) : (
                <Eye className="size-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium text-sm">De-identify PII</p>
                <p className="text-xs text-muted-foreground">
                  Mask patient names and IDs during AI analysis (DPDP Act compliant)
                </p>
              </div>
            </div>
            <Switch 
              checked={deidentifyPII} 
              onCheckedChange={onToggleDeidentify}
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Analysis Area */}
      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analysis" className="gap-2">
            <Brain className="size-4" />
            <span className="hidden sm:inline">AI Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="rates" className="gap-2">
            <Calculator className="size-4" />
            <span className="hidden sm:inline">Rate Checker</span>
          </TabsTrigger>
          <TabsTrigger value="appeal" className="gap-2">
            <Scale className="size-4" />
            <span className="hidden sm:inline">Appeal</span>
          </TabsTrigger>
        </TabsList>

        {/* AI Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="size-4 text-teal-500" />
                  Clinical Notes
                </CardTitle>
                <Button 
                  size="sm" 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="gap-2 bg-teal-600 hover:bg-teal-700"
                >
                  {isAnalyzing ? (
                    <>
                      <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      Run AI Analysis
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-muted/50 border border-border max-h-[300px] overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap font-mono text-muted-foreground leading-relaxed">
                  {deidentifyText(claim.clinicalNotes, deidentifyPII)}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* AI Findings */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="size-4 text-emerald-500" />
                AI Findings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle className="size-5 text-emerald-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-emerald-500">Documentation Complete</p>
                  <p className="text-xs text-muted-foreground">All required clinical documentation is present</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle className="size-5 text-emerald-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-emerald-500">Medical Necessity Established</p>
                  <p className="text-xs text-muted-foreground">Clinical findings support the recommended procedure</p>
                </div>
              </div>
              {claim.status === "Denied" && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <AlertTriangle className="size-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-yellow-500">Appeal Recommended</p>
                    <p className="text-xs text-muted-foreground">Documentation supports appeal for this denial</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PM-JAY Rate Checker Tab */}
        <TabsContent value="rates">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <IndianRupee className="size-4 text-teal-500" />
                PM-JAY / TPA Rate Comparison
              </CardTitle>
              <CardDescription>
                Compare hospital billing against official government package rates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Hospital Bill</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{claim.amount}</p>
                  <p className="text-xs text-muted-foreground mt-1">Submitted amount</p>
                </div>
                <div className="p-4 rounded-lg bg-teal-500/10 border border-teal-500/20">
                  <p className="text-xs text-teal-500 uppercase tracking-wider">
                    {claim.tpaType === "government" ? "PM-JAY Rate" : "Standard Rate"}
                  </p>
                  <p className="text-2xl font-bold text-teal-500 mt-1">
                    {packageRate ? `₹${packageRate.rate.toLocaleString('en-IN')}` : "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {packageRate?.name || "Rate not found"}
                  </p>
                </div>
              </div>

              {packageRate && (
                <div className={`p-4 rounded-lg border ${
                  hasDiscrepancy 
                    ? "bg-red-500/10 border-red-500/20" 
                    : "bg-emerald-500/10 border-emerald-500/20"
                }`}>
                  <div className="flex items-center gap-2">
                    {hasDiscrepancy ? (
                      <AlertTriangle className="size-5 text-red-500" />
                    ) : (
                      <CheckCircle className="size-5 text-emerald-500" />
                    )}
                    <div>
                      <p className={`font-medium ${hasDiscrepancy ? "text-red-500" : "text-emerald-500"}`}>
                        {hasDiscrepancy 
                          ? `Rate Discrepancy: ₹${rateDiscrepancy.toLocaleString('en-IN')} above package rate`
                          : "Within Package Rate Limits"
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {hasDiscrepancy 
                          ? "Hospital bill exceeds official package rate - may require justification"
                          : "Bill amount is within approved package rate"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Note:</span> Package rates are based on current PM-JAY/CGHS guidelines. 
                  Private TPA rates may vary based on network agreements.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appeal Generator Tab */}
        <TabsContent value="appeal">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Scale className="size-4 text-teal-500" />
                AI Appeal Letter Generator
              </CardTitle>
              <CardDescription>
                Generate a medical necessity justification letter for TPA denials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {claim.status !== "Denied" && claim.status !== "Appealed" && (
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-5 text-yellow-500" />
                    <p className="text-sm text-yellow-500">
                      This claim is not in denied status. Appeal generation is typically used for denied claims.
                    </p>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleGenerateAppeal}
                disabled={isGeneratingAppeal}
                className="w-full gap-2 bg-teal-600 hover:bg-teal-700"
              >
                {isGeneratingAppeal ? (
                  <>
                    <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating Appeal...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    Generate Medical Necessity Justification
                  </>
                )}
              </Button>

              {appealLetter && (
                <div className="space-y-3">
                  <Textarea 
                    value={appealLetter}
                    onChange={(e) => setAppealLetter(e.target.value)}
                    className="min-h-[400px] font-mono text-sm"
                  />
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => {
                        toast.success("Appeal Submitted", {
                          description: `Appeal letter sent to ${claim.tpa} for review`
                        })
                      }}
                    >
                      <Send className="size-4" />
                      Submit Appeal
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <FileText className="size-4" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
