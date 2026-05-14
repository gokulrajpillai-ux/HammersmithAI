"use client"

import { IndianRupee, CheckCircle, Clock, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string
  rawValue?: number
  subValue?: string
  icon: React.ReactNode
  trend?: {
    value: string
    positive: boolean
  }
  highlight?: "success" | "warning" | "danger"
  pulseThreshold?: number
}

function MetricCard({ title, value, rawValue, subValue, icon, trend, highlight, pulseThreshold }: MetricCardProps) {
  const shouldPulse = highlight === "danger" && pulseThreshold && rawValue && rawValue > pulseThreshold

  return (
    <Card className={cn(
      "bg-card border-border",
      shouldPulse && "animate-pulse-red border-destructive"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className={cn(
                "text-3xl font-bold text-card-foreground",
                shouldPulse && "text-destructive"
              )}>{value}</p>
              {subValue && (
                <span className="text-sm text-muted-foreground">{subValue}</span>
              )}
            </div>
            {trend && (
              <div className="flex items-center gap-1.5">
                {trend.positive ? (
                  <TrendingUp className="size-4 text-success" />
                ) : (
                  <TrendingDown className="size-4 text-destructive" />
                )}
                <span className={trend.positive ? "text-sm text-success" : "text-sm text-destructive"}>
                  {trend.value}
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
          <div className={cn(
            "flex size-12 items-center justify-center rounded-xl",
            highlight === "success" ? "bg-success/10" :
            highlight === "warning" ? "bg-warning/10" :
            highlight === "danger" ? "bg-destructive/10" : "bg-primary/10",
            shouldPulse && "bg-destructive/20"
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function MetricCards() {
  // Revenue at risk in raw value (18.6L = 1860000)
  const revenueAtRisk = 1860000

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        title="Total AR"
        value="₹2.4Cr"
        subValue="outstanding"
        icon={<IndianRupee className="size-6 text-primary" />}
        trend={{ value: "+12.5%", positive: true }}
      />
      <MetricCard
        title="Clean Claim Rate"
        value="94%"
        icon={<CheckCircle className="size-6 text-success" />}
        trend={{ value: "+2.3%", positive: true }}
        highlight="success"
      />
      <MetricCard
        title="Days in AR"
        value="38"
        subValue="days"
        icon={<Clock className="size-6 text-warning" />}
        trend={{ value: "-4 days", positive: true }}
        highlight="warning"
      />
      <MetricCard
        title="Revenue at Risk"
        value="₹18.6L"
        rawValue={revenueAtRisk}
        icon={<AlertTriangle className="size-6 text-destructive" />}
        trend={{ value: "-8.2%", positive: true }}
        highlight="danger"
        pulseThreshold={500000}
      />
    </div>
  )
}
