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
  ChevronRight
} from "lucide-react"
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
  const [auditingClaimId, setAuditingClaimId] = useState<string | null>(null)
  const [auditResults, setAuditResults] = useState<Record<string, { suggestion: string; potentialIncrease: number }>>({})

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

  // Run AI Audit for a specific claim
  const runAIAudit = async (claim: Claim) => {
    const packageCode = claim.medical_packages?.package_code
    if (!packageCode) return

    setAuditingClaimId(claim.id)

    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2500))

    const suggestion = aiSuggestions[packageCode]
    if (suggestion) {
      setAuditResults(prev => ({
        ...prev,
        [claim.id]: suggestion
      }))
      toast.success("AI Audit Complete", {
        description: `Found optimization opportunity for ${claim.patients?.first_name} ${claim.patients?.last_name}`
      })
    } else {
      toast.info("Audit Complete", {
        description: "No optimization opportunities found for this claim"
      })
    }

    setAuditingClaimId(null)
  }

  // Format currency in Indian format
  const formatINR = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Calculate leakage
  const calculateLeakage = (bill: number, rate: number): number => {
    return bill > rate ? bill - rate : 0
  }

  // Get status badge
  const getStatusBadge = (status: Claim['status']) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"><CheckCircle className="size-3 mr-1" />Approved</Badge>
      case 'denied':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="size-3 mr-1" />Denied</Badge>
      case 'under_review':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30"><Clock className="size-3 mr-1" />Under Review</Badge>
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
                    const isAuditing = auditingClaimId === claim.id

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

                              {/* Leakage Alert */}
                              {hasLeakage && (
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/30">
                                  <AlertTriangle className="size-4 text-red-400" />
                                  <span className="text-sm font-medium text-red-400">
                                    Revenue Leakage: {formatINR(leakage)}
                                  </span>
                                </div>
                              )}

                              {/* AI Audit Result */}
                              {auditResult && (
                                <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="size-4 text-primary" />
                                    <span className="text-sm font-semibold text-primary">AI Optimization Found</span>
                                  </div>
                                  <p className="text-sm text-card-foreground">{auditResult.suggestion}</p>
                                  <p className="text-sm font-semibold text-emerald-400 mt-2">
                                    Potential Revenue Increase: {formatINR(auditResult.potentialIncrease)}
                                  </p>
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
    </DashboardLayout>
  )
}
