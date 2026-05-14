"use client"

import { useState } from "react"
import { toast } from "sonner"
import { IndianRupee, CreditCard, Building, ArrowRight, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { PatientData } from "@/app/patient-portal/page"

interface BalanceCardProps {
  patient: PatientData
}

export function BalanceCard({ patient }: BalanceCardProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const totalBilled = patient.insurancePaid + patient.patientResponsibility
  const insurancePercentage = (patient.insurancePaid / totalBilled) * 100
  const patientPercentage = (patient.patientResponsibility / totalBilled) * 100

  const handleMakePayment = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      toast.success("Redirecting to Payment Gateway", {
        description: "You will be redirected to our secure payment portal.",
      })
    }, 1000)
  }

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <IndianRupee className="size-5 text-primary" />
          Account Balance Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Outstanding */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <p className="text-sm text-muted-foreground mb-1">Total Outstanding Balance</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">
              {formatCurrency(patient.totalBalance)}
            </span>
          </div>
          <Button 
            className="mt-4 w-full sm:w-auto gap-2"
            size="lg"
            onClick={handleMakePayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="size-4" />
                Make Payment
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </div>

        {/* Breakdown */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Payment Breakdown</h4>
          
          <div className="space-y-3">
            {/* Insurance Paid */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Building className="size-4 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium">Insurance Paid</p>
                  <p className="text-xs text-muted-foreground">Processed by payer</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-success">{formatCurrency(patient.insurancePaid)}</p>
                <p className="text-xs text-muted-foreground">{insurancePercentage.toFixed(0)}% of total</p>
              </div>
            </div>

            {/* Patient Responsibility */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <IndianRupee className="size-4 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium">Patient Responsibility</p>
                  <p className="text-xs text-muted-foreground">Your portion</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-warning">{formatCurrency(patient.patientResponsibility)}</p>
                <p className="text-xs text-muted-foreground">{patientPercentage.toFixed(0)}% of total</p>
              </div>
            </div>
          </div>

          {/* Visual Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Total Billed: {formatCurrency(totalBilled)}</span>
              <span className="flex items-center gap-1">
                <CheckCircle className="size-3 text-success" />
                {insurancePercentage.toFixed(0)}% covered
              </span>
            </div>
            <div className="relative h-3 rounded-full bg-secondary overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-success rounded-full"
                style={{ width: `${insurancePercentage}%` }}
              />
              <div 
                className="absolute top-0 h-full bg-warning rounded-full"
                style={{ left: `${insurancePercentage}%`, width: `${patientPercentage}%` }}
              />
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-success" />
                <span className="text-muted-foreground">Insurance</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-warning" />
                <span className="text-muted-foreground">Your Responsibility</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
