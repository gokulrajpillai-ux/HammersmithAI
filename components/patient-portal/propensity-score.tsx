"use client"

import { Sparkles, TrendingUp, Clock, CreditCard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PatientData } from "@/app/patient-portal/page"

interface PropensityScoreProps {
  patient: PatientData
}

export function PropensityScore({ patient }: PropensityScoreProps) {
  const getScoreColor = (score: "high" | "medium" | "low") => {
    switch (score) {
      case "high": return { text: "text-success", bg: "bg-success", border: "border-success/30" }
      case "medium": return { text: "text-warning", bg: "bg-warning", border: "border-warning/30" }
      case "low": return { text: "text-destructive", bg: "bg-destructive", border: "border-destructive/30" }
    }
  }

  const colors = getScoreColor(patient.propensityScore)

  // Calculate the circumference and stroke offset for the circular gauge
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeOffset = circumference - (patient.propensityPercentage / 100) * circumference

  return (
    <Card className={`bg-card border-border ${colors.border}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          AI Propensity Score
          <Badge variant="outline" className="ml-auto text-xs bg-secondary">
            Staff Only
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Circular Gauge */}
        <div className="flex items-center justify-center py-4">
          <div className="relative">
            <svg className="size-32 -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-secondary"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                className={colors.text}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${colors.text}`}>
                {patient.propensityPercentage}%
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {patient.propensityScore}
              </span>
            </div>
          </div>
        </div>

        {/* Score Explanation */}
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            Based on payment history and demographic analysis, this patient has a{" "}
            <span className={`font-medium ${colors.text}`}>{patient.propensityScore}</span>{" "}
            probability of completing payment.
          </p>
        </div>

        {/* Factors */}
        <div className="space-y-2 pt-2 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Contributing Factors
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="size-3.5 text-success" />
              <span>Consistent payment history</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="size-3.5 text-success" />
              <span>Average pay time: 12 days</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="size-3.5 text-success" />
              <span>Multiple payment methods on file</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
