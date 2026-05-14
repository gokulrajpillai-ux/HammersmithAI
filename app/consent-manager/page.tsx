"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ConsentHeader } from "@/components/consent/header"
import { ConsentRequestForm } from "@/components/consent/consent-request-form"
import { ConsentQueue } from "@/components/consent/consent-queue"
import { ConsentDetails } from "@/components/consent/consent-details"

export interface ConsentRequest {
  id: string
  patientName: string
  abhaAddress: string
  recordTypes: string[]
  purpose: string
  duration: string
  status: "pending" | "granted" | "denied" | "expired"
  requestDate: string
  expiryDate?: string
}

export default function ConsentManagerPage() {
  const [selectedConsent, setSelectedConsent] = useState<ConsentRequest | null>(null)

  return (
    <DashboardLayout>
      <ConsentHeader />
      <div className="p-4 lg:p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Side - Request Form & Queue */}
          <div className="space-y-6">
            <ConsentRequestForm />
            <ConsentQueue onSelect={setSelectedConsent} selectedId={selectedConsent?.id} />
          </div>
          
          {/* Right Side - Consent Details */}
          <div>
            <ConsentDetails consent={selectedConsent} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
