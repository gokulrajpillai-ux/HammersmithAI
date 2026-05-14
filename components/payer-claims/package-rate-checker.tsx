"use client"

import { useState } from "react"
import { Search, AlertTriangle, CheckCircle, IndianRupee } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { PayerType } from "@/app/payer-claims/page"

interface PackageRateCheckerProps {
  payerType: PayerType
}

interface PackageResult {
  code: string
  name: string
  pmjayRate: number
  hospitalRate: number
  category: string
}

const mockResults: PackageResult[] = [
  {
    code: "AB-HBP-S-C-0001",
    name: "Coronary Angiography",
    pmjayRate: 12000,
    hospitalRate: 18500,
    category: "Cardiology",
  },
  {
    code: "AB-HBP-S-C-0015",
    name: "PTCA with Single Stent",
    pmjayRate: 55000,
    hospitalRate: 85000,
    category: "Cardiology",
  },
  {
    code: "AB-HBP-S-O-0042",
    name: "Total Knee Replacement",
    pmjayRate: 75000,
    hospitalRate: 125000,
    category: "Orthopedics",
  },
]

export function PackageRateChecker({ payerType }: PackageRateCheckerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<PackageResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    setTimeout(() => {
      setResults(mockResults.filter(r => 
        r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
      ))
      if (results.length === 0) setResults(mockResults.slice(0, 2))
      setIsSearching(false)
    }, 800)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <IndianRupee className="size-5 text-orange-500" />
          Package Rate Checker
        </CardTitle>
        <CardDescription>
          {payerType === "pmjay" 
            ? "Search PM-JAY procedure codes and compare rates"
            : "Check TPA-approved package rates"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by code or procedure name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? (
              <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((result) => {
              const difference = result.hospitalRate - result.pmjayRate
              const percentDiff = ((difference / result.pmjayRate) * 100).toFixed(0)
              const hasDiscrepancy = difference > 0

              return (
                <div 
                  key={result.code}
                  className="p-4 rounded-lg border border-border bg-muted/30"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                          {result.code}
                        </code>
                        <Badge variant="outline" className="text-xs">
                          {result.category}
                        </Badge>
                      </div>
                      <p className="font-medium mt-1">{result.name}</p>
                    </div>
                    {hasDiscrepancy ? (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                        <AlertTriangle className="size-3 mr-1" />
                        +{percentDiff}% Gap
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                        <CheckCircle className="size-3 mr-1" />
                        Aligned
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <p className="text-xs text-muted-foreground mb-1">
                        {payerType === "pmjay" ? "PM-JAY Rate" : "TPA Approved"}
                      </p>
                      <p className="text-lg font-semibold text-orange-500">
                        {formatCurrency(result.pmjayRate)}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${
                      hasDiscrepancy 
                        ? "bg-amber-500/10 border border-amber-500/20" 
                        : "bg-muted border border-border"
                    }`}>
                      <p className="text-xs text-muted-foreground mb-1">Hospital Rate</p>
                      <p className={`text-lg font-semibold ${
                        hasDiscrepancy ? "text-amber-500" : "text-foreground"
                      }`}>
                        {formatCurrency(result.hospitalRate)}
                      </p>
                    </div>
                  </div>

                  {hasDiscrepancy && (
                    <p className="text-xs text-amber-500 mt-2">
                      Discrepancy of {formatCurrency(difference)} - Patient may need to cover the difference
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {results.length === 0 && searchQuery && !isSearching && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No packages found. Try a different search term.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
