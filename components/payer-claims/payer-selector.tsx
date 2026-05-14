"use client"

import { Heart, Building2, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { SelectedPayer, PayerType } from "@/app/payer-claims/page"

interface PayerSelectorProps {
  selectedPayer: SelectedPayer
  onSelect: (payer: SelectedPayer) => void
}

interface PayerOption {
  type: PayerType
  id: string
  name: string
  description: string
}

const publicSchemes: PayerOption[] = [
  {
    type: "pmjay",
    id: "pmjay",
    name: "PM-JAY (Ayushman Bharat)",
    description: "Central Government Scheme",
  },
  {
    type: "pmjay",
    id: "cghs",
    name: "CGHS",
    description: "Central Govt Health Scheme",
  },
  {
    type: "pmjay",
    id: "esis",
    name: "ESIC",
    description: "Employee State Insurance",
  },
]

const privateTPA: PayerOption[] = [
  {
    type: "tpa",
    id: "star",
    name: "Star Health Insurance",
    description: "Private TPA",
  },
  {
    type: "tpa",
    id: "niva",
    name: "Niva Bupa",
    description: "Private TPA",
  },
  {
    type: "tpa",
    id: "icici",
    name: "ICICI Lombard",
    description: "Private TPA",
  },
  {
    type: "tpa",
    id: "hdfc",
    name: "HDFC ERGO",
    description: "Private TPA",
  },
  {
    type: "tpa",
    id: "bajaj",
    name: "Bajaj Allianz",
    description: "Private TPA",
  },
]

export function PayerSelector({ selectedPayer, onSelect }: PayerSelectorProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Payer Selection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Public Schemes */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Heart className="size-4 text-orange-500" />
            <span className="text-sm font-medium">Public Schemes</span>
          </div>
          <div className="space-y-1">
            {publicSchemes.map((payer) => (
              <button
                key={payer.id}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors",
                  selectedPayer.id === payer.id
                    ? "bg-orange-500/10 border border-orange-500/30"
                    : "hover:bg-muted border border-transparent"
                )}
                onClick={() => onSelect(payer)}
              >
                <div>
                  <p className={cn(
                    "text-sm font-medium",
                    selectedPayer.id === payer.id && "text-orange-500"
                  )}>
                    {payer.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{payer.description}</p>
                </div>
                <ChevronRight className={cn(
                  "size-4",
                  selectedPayer.id === payer.id ? "text-orange-500" : "text-muted-foreground"
                )} />
              </button>
            ))}
          </div>
        </div>

        {/* Private TPA */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="size-4 text-blue-500" />
            <span className="text-sm font-medium">Private TPA</span>
          </div>
          <div className="space-y-1">
            {privateTPA.map((payer) => (
              <button
                key={payer.id}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors",
                  selectedPayer.id === payer.id
                    ? "bg-blue-500/10 border border-blue-500/30"
                    : "hover:bg-muted border border-transparent"
                )}
                onClick={() => onSelect(payer)}
              >
                <div>
                  <p className={cn(
                    "text-sm font-medium",
                    selectedPayer.id === payer.id && "text-blue-500"
                  )}>
                    {payer.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{payer.description}</p>
                </div>
                <ChevronRight className={cn(
                  "size-4",
                  selectedPayer.id === payer.id ? "text-blue-500" : "text-muted-foreground"
                )} />
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
