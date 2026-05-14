"use client"

import { useState } from "react"
import { Search, Filter, Download, ArrowUpDown, ChevronDown, User, Building, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import type { DeniedClaim } from "@/app/denial-management/page"

interface DenialQueueProps {
  denials: DeniedClaim[]
  onSelectDenial: (denial: DeniedClaim) => void
  selectedDenialId?: string
}

export function DenialQueue({ denials, onSelectDenial, selectedDenialId }: DenialQueueProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<"date" | "priority" | "amount">("priority")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const getPriorityBadge = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20">High</Badge>
      case "medium":
        return <Badge className="bg-warning/10 text-warning border-warning/30 hover:bg-warning/20">Medium</Badge>
      case "low":
        return <Badge className="bg-muted text-muted-foreground border-border hover:bg-muted/80">Low</Badge>
    }
  }

  const getRecoveryColor = (prob: number) => {
    if (prob >= 80) return "text-success"
    if (prob >= 50) return "text-warning"
    return "text-destructive"
  }

  const filteredDenials = denials.filter(d => 
    d.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.payer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.denialCode.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedDenials = [...filteredDenials].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        comparison = priorityOrder[a.aiPriority] - priorityOrder[b.aiPriority]
        break
      case "date":
        comparison = new Date(a.denialDate).getTime() - new Date(b.denialDate).getTime()
        break
      case "amount":
        const amountA = parseInt(a.totalCharge.replace(/[₹,]/g, ""))
        const amountB = parseInt(b.totalCharge.replace(/[₹,]/g, ""))
        comparison = amountA - amountB
        break
    }
    return sortOrder === "desc" ? -comparison : comparison
  })

  const handleSort = (field: "date" | "priority" | "amount") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  return (
    <Card className="flex-1 flex flex-col overflow-hidden bg-card border-border">
      <CardHeader className="border-b border-border py-3 px-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-base font-semibold">
            Denial Queue
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({filteredDenials.length} claims)
            </span>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                placeholder="Search claims..." 
                className="pl-9 w-48 lg:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => toast.info("Filter options coming soon")}
            >
              <Filter className="size-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => toast.success("Export started", { description: "Denial report will download shortly." })}
            >
              <Download className="size-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[120px]">Claim ID</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Payer</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("amount")}>
                <div className="flex items-center gap-1">
                  Charge
                  <ArrowUpDown className="size-3" />
                </div>
              </TableHead>
              <TableHead>Denial Code</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                <div className="flex items-center gap-1">
                  Date
                  <ArrowUpDown className="size-3" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("priority")}>
                <div className="flex items-center gap-1">
                  AI Priority
                  <ArrowUpDown className="size-3" />
                </div>
              </TableHead>
              <TableHead className="text-right">Recovery %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDenials.map((denial) => (
              <TableRow 
                key={denial.id}
                className={`cursor-pointer transition-colors ${
                  selectedDenialId === denial.id ? "bg-primary/10" : ""
                }`}
                onClick={() => onSelectDenial(denial)}
              >
                <TableCell className="font-mono text-sm">{denial.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-secondary flex items-center justify-center">
                      <User className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{denial.patientName}</p>
                      <p className="text-xs text-muted-foreground">{denial.patientMrn}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Building className="size-3.5 text-muted-foreground" />
                    <span className="text-sm">{denial.payer}</span>
                  </div>
                </TableCell>
                <TableCell className="font-semibold">{denial.totalCharge}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-1 h-auto py-1 px-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {denial.denialCode}
                        </Badge>
                        <ChevronDown className="size-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="max-w-[300px]">
                      <DropdownMenuItem className="flex-col items-start cursor-default">
                        <span className="font-medium">{denial.denialCode}</span>
                        <span className="text-xs text-muted-foreground mt-1">
                          {denial.denialReason}
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-muted-foreground" />
                    <span className="text-sm">{denial.denialDate}</span>
                  </div>
                </TableCell>
                <TableCell>{getPriorityBadge(denial.aiPriority)}</TableCell>
                <TableCell className="text-right">
                  <span className={`font-semibold ${getRecoveryColor(denial.recoveryProbability)}`}>
                    {denial.recoveryProbability}%
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
