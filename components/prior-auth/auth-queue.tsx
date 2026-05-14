"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { AuthRequest } from "@/app/prior-auth/page"

interface AuthQueueProps {
  requests: AuthRequest[]
  selectedId?: string
  onSelect: (request: AuthRequest) => void
}

const getRiskBadge = (risk: AuthRequest["riskScore"]) => {
  switch (risk) {
    case "high":
      return <Badge variant="destructive" className="text-xs">High Risk</Badge>
    case "medium":
      return <Badge className="bg-warning text-warning-foreground text-xs">Medium</Badge>
    case "low":
      return <Badge className="bg-success text-success-foreground text-xs">Low Risk</Badge>
  }
}

export function AuthQueue({ requests, selectedId, onSelect }: AuthQueueProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredRequests = requests.filter(req => 
    req.patientMRN.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.procedureCode.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Authorization Queue</CardTitle>
          <span className="text-xs text-muted-foreground">{requests.length} pending</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search MRN, patient, CPT..."
            className="pl-9 h-9 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto max-h-[calc(100vh-280px)]">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[120px]">Patient MRN</TableHead>
                <TableHead>Payer</TableHead>
                <TableHead>CPT Code</TableHead>
                <TableHead className="hidden md:table-cell">Submitted</TableHead>
                <TableHead className="text-right">AI Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow
                  key={request.id}
                  className={cn(
                    "cursor-pointer transition-colors",
                    selectedId === request.id && "bg-primary/10"
                  )}
                  onClick={() => onSelect(request)}
                >
                  <TableCell className="font-medium">
                    <div>
                      <p className="text-sm">{request.patientMRN}</p>
                      <p className="text-xs text-muted-foreground">{request.patientName}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{request.payer}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-mono">{request.procedureCode}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[120px]">{request.procedureDesc}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {request.submittedDate}
                  </TableCell>
                  <TableCell className="text-right">
                    {getRiskBadge(request.riskScore)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
