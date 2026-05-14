"use client"

import { toast } from "sonner"
import { Sparkles, Percent, Calendar, Clock, CheckCircle, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface PaymentPlansProps {
  balance: number
}

export function PaymentPlans({ balance }: PaymentPlansProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const plans = [
    {
      id: "immediate",
      name: "Pay in Full",
      subtitle: "Immediate Payment",
      icon: Percent,
      highlight: "5% Discount",
      highlightColor: "bg-success/10 text-success border-success/30",
      description: "Pay your full balance today and save 5%",
      amount: balance * 0.95,
      savings: balance * 0.05,
      features: [
        "5% instant discount applied",
        "Clear your balance immediately",
        "No future payments to track",
      ],
      recommended: true,
    },
    {
      id: "3-month",
      name: "3-Month Plan",
      subtitle: "Interest-Free",
      icon: Calendar,
      highlight: "0% Interest",
      highlightColor: "bg-primary/10 text-primary border-primary/30",
      description: "Split your balance into 3 easy payments",
      amount: balance / 3,
      perMonth: true,
      features: [
        "No interest charges",
        "Automatic monthly billing",
        "Flexible payment dates",
      ],
      recommended: false,
    },
    {
      id: "6-month",
      name: "6-Month Plan",
      subtitle: "Flexible",
      icon: Clock,
      highlight: "Low Monthly",
      highlightColor: "bg-warning/10 text-warning border-warning/30",
      description: "Extended plan for manageable payments",
      amount: balance / 6,
      perMonth: true,
      features: [
        "Lowest monthly payment",
        "Automatic reminders",
        "Skip a payment option",
      ],
      recommended: false,
    },
  ]

  const handleSelectPlan = (planId: string, planName: string) => {
    toast.success("Plan Selected", {
      description: `You selected the ${planName}. Redirecting to setup...`,
    })
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          Personalized Payment Options
          <Badge variant="secondary" className="ml-2 text-xs">AI Generated</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Based on your account, here are your best payment options:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative p-4 rounded-xl border transition-all hover:border-primary/50 ${
                plan.recommended 
                  ? "border-primary/30 bg-primary/5" 
                  : "border-border bg-secondary/30"
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <Badge className="gap-1 bg-primary text-primary-foreground">
                    <Star className="size-3" />
                    Recommended
                  </Badge>
                </div>
              )}

              <div className="pt-2 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground">{plan.subtitle}</p>
                  </div>
                  <Badge variant="outline" className={plan.highlightColor}>
                    {plan.highlight}
                  </Badge>
                </div>

                {/* Amount */}
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground">
                      {formatCurrency(plan.amount)}
                    </span>
                    {plan.perMonth && (
                      <span className="text-sm text-muted-foreground">/month</span>
                    )}
                  </div>
                  {plan.savings && (
                    <p className="text-xs text-success mt-1">
                      You save {formatCurrency(plan.savings)}
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="size-3.5 text-success shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button 
                  className="w-full" 
                  variant={plan.recommended ? "default" : "outline"}
                  onClick={() => handleSelectPlan(plan.id, plan.name)}
                >
                  Select Plan
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
