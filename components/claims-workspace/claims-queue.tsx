"use client"

import { Search, Building2, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useState } from "react"
import type { ClaimData } from "@/app/dashboard/claims/page"

interface ClaimsQueueProps {
  claims: ClaimData[]
  selectedClaim: ClaimData | null
  onSelectClaim: (claim: ClaimData) => void
}

const statusColors: Record<string, string> = {
  "Pending": "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
  "In Review": "bg-blue-500/20 text-blue-500 border-blue-500/30",
  "Approved": "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
  "Denied": "bg-red-500/20 text-red-500 border-red-500/30",
  "Appealed": "bg-purple-500/20 text-purple-500 border-purple-500/30",
}

export function ClaimsQueue({ claims, selectedClaim, onSelectClaim }: ClaimsQueueProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredClaims = claims.filter(claim => 
    claim.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    claim.abhaId.includes(searchQuery) ||
    claim.tpa.toLowerCase().includes(searchQuery.toLowerCase()) ||
    claim.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Card className="bg-card border-border h-fit">
      <CardHeader className="pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Claims Queue</CardTitle>
          <span className="text-xs text-muted-foreground">{claims.length} claims</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ABHA, TPA..."
            className="pl-9 h-9 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border max-h-[calc(100vh-300px)] overflow-y-auto">
          {filteredClaims.map((claim) => (
            <button
              key={claim.id}
              onClick={() => onSelectClaim(claim)}
              className={cn(
                "w-full p-4 text-left hover:bg-muted/50 transition-colors",
                selectedClaim?.id === claim.id && "bg-teal-500/10 border-l-2 border-l-teal-500"
              )}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">{claim.patientName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{claim.abhaId}</p>
                  </div>
                  <Badge variant="outline" className={cn("text-xs", statusColors[claim.status])}>
                    {claim.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  {claim.tpaType === "government" ? (
                    <Shield className="size-3 text-emerald-500" />
                  ) : (
                    <Building2 className="size-3 text-blue-500" />
                  )}
                  <span className="text-xs text-muted-foreground">{claim.tpa}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs font-medium">{claim.amount}</span>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">{claim.procedureCode}</span>
                  <span>•</span>
                  <span>{claim.admissionDate}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
