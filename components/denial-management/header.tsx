"use client"

import { Home, ChevronRight, AlertTriangle, TrendingUp, IndianRupee, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface DenialHeaderProps {
  stats: {
    total: number
    highPriority: number
    totalValue: string
    avgRecovery: number
  }
}

export function DenialHeader({ stats }: DenialHeaderProps) {
  return (
    <header className="border-b border-border bg-card px-4 lg:px-6 py-4">
      <div className="flex flex-col gap-4">
        {/* Breadcrumbs */}
        <div className="flex flex-col gap-2 pl-12 md:pl-0">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Home className="size-4" />
            <ChevronRight className="size-3" />
            <span>Denials</span>
            <ChevronRight className="size-3" />
            <span className="text-foreground font-medium">Denial Management & Appeals</span>
          </nav>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="size-5 lg:size-6 text-destructive" />
            Denial Management & Appeals
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="bg-secondary/30 border-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <AlertTriangle className="size-4 text-destructive" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Denials</p>
                  <p className="text-lg font-bold text-foreground">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary/30 border-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Target className="size-4 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">High Priority</p>
                  <p className="text-lg font-bold text-foreground">{stats.highPriority}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary/30 border-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <IndianRupee className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total at Risk</p>
                  <p className="text-lg font-bold text-foreground">{stats.totalValue}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary/30 border-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-success/10">
                  <TrendingUp className="size-4 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Recovery Rate</p>
                  <p className="text-lg font-bold text-foreground">{stats.avgRecovery}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </header>
  )
}
