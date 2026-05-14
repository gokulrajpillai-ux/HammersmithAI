"use client"

import { Clock, TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ARData {
  payer: string
  type: "public" | "tpa"
  totalClaims: number
  totalAmount: string
  avgDaysAR: number
  trend: "up" | "down" | "stable"
  trendValue: string
}

const arData: ARData[] = [
  {
    payer: "PM-JAY (Ayushman Bharat)",
    type: "public",
    totalClaims: 156,
    totalAmount: "₹45,20,000",
    avgDaysAR: 42,
    trend: "down",
    trendValue: "-5 days",
  },
  {
    payer: "Star Health Insurance",
    type: "tpa",
    totalClaims: 89,
    totalAmount: "₹32,15,000",
    avgDaysAR: 28,
    trend: "stable",
    trendValue: "0 days",
  },
  {
    payer: "ICICI Lombard",
    type: "tpa",
    totalClaims: 67,
    totalAmount: "₹24,80,000",
    avgDaysAR: 35,
    trend: "up",
    trendValue: "+3 days",
  },
  {
    payer: "CGHS",
    type: "public",
    totalClaims: 45,
    totalAmount: "₹18,90,000",
    avgDaysAR: 55,
    trend: "up",
    trendValue: "+8 days",
  },
  {
    payer: "HDFC ERGO",
    type: "tpa",
    totalClaims: 52,
    totalAmount: "₹19,45,000",
    avgDaysAR: 22,
    trend: "down",
    trendValue: "-2 days",
  },
  {
    payer: "Niva Bupa",
    type: "tpa",
    totalClaims: 38,
    totalAmount: "₹14,20,000",
    avgDaysAR: 30,
    trend: "stable",
    trendValue: "0 days",
  },
]

export function ARDaysTable() {
  const getARBadgeColor = (days: number) => {
    if (days <= 30) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    if (days <= 45) return "bg-amber-500/10 text-amber-500 border-amber-500/20"
    return "bg-destructive/10 text-destructive border-destructive/20"
  }

  const getTrendIcon = (trend: ARData["trend"]) => {
    if (trend === "up") return <TrendingUp className="size-4 text-destructive" />
    if (trend === "down") return <TrendingDown className="size-4 text-emerald-500" />
    return <span className="size-4 text-muted-foreground">—</span>
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="size-5 text-primary" />
              Days in AR by Payer
            </CardTitle>
            <CardDescription>
              Accounts Receivable aging for Indian insurance cycles
            </CardDescription>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">&lt; 30 days</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-amber-500" />
              <span className="text-muted-foreground">30-45 days</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-destructive" />
              <span className="text-muted-foreground">&gt; 45 days</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" size="sm" className="gap-1 -ml-3">
                  Payer
                  <ArrowUpDown className="size-3" />
                </Button>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Claims</TableHead>
              <TableHead className="text-right">Total AR</TableHead>
              <TableHead className="text-right">
                <Button variant="ghost" size="sm" className="gap-1">
                  Avg Days
                  <ArrowUpDown className="size-3" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {arData.map((row) => (
              <TableRow key={row.payer}>
                <TableCell className="font-medium">{row.payer}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      row.type === "public" 
                        ? "bg-orange-500/10 text-orange-500 border-orange-500/20"
                        : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    }`}
                  >
                    {row.type === "public" ? "Public" : "TPA"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{row.totalClaims}</TableCell>
                <TableCell className="text-right font-mono">{row.totalAmount}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className={getARBadgeColor(row.avgDaysAR)}>
                    {row.avgDaysAR} days
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {getTrendIcon(row.trend)}
                    <span className={`text-sm ${
                      row.trend === "up" ? "text-destructive" :
                      row.trend === "down" ? "text-emerald-500" :
                      "text-muted-foreground"
                    }`}>
                      {row.trendValue}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
