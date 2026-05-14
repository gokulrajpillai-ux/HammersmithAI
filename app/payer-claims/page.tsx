"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { PayerHeader } from "@/components/payer-claims/header"
import { PayerSelector } from "@/components/payer-claims/payer-selector"
import { PackageRateChecker } from "@/components/payer-claims/package-rate-checker"
import { TPAQueryResolver } from "@/components/payer-claims/tpa-query-resolver"
import { ARDaysTable } from "@/components/payer-claims/ar-days-table"

export type PayerType = "tpa" | "pmjay"
export type SelectedPayer = {
  type: PayerType
  name: string
  id: string
}

export default function PayerClaimsPage() {
  const [selectedPayer, setSelectedPayer] = useState<SelectedPayer>({
    type: "pmjay",
    name: "PM-JAY (Ayushman Bharat)",
    id: "pmjay",
  })

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 md:ml-64">
        <PayerHeader selectedPayer={selectedPayer} />
        <div className="p-4 lg:p-6">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Sidebar - Payer Selection */}
            <div className="lg:col-span-3">
              <PayerSelector 
                selectedPayer={selectedPayer} 
                onSelect={setSelectedPayer} 
              />
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-9 space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <PackageRateChecker payerType={selectedPayer.type} />
                <TPAQueryResolver payerName={selectedPayer.name} />
              </div>
              <ARDaysTable />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
