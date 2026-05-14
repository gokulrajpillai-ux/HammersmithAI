"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PatientHeader } from "@/components/patient-portal/header"
import { BalanceCard } from "@/components/patient-portal/balance-card"
import { PropensityScore } from "@/components/patient-portal/propensity-score"
import { PaymentPlans } from "@/components/patient-portal/payment-plans"
import { TransactionHistory } from "@/components/patient-portal/transaction-history"
import { AIChat } from "@/components/patient-portal/ai-chat"

export interface PatientData {
  name: string
  accountNumber: string
  totalBalance: number
  insurancePaid: number
  patientResponsibility: number
  propensityScore: "high" | "medium" | "low"
  propensityPercentage: number
}

const patientData: PatientData = {
  name: "Ananya Reddy",
  accountNumber: "PAT-2026-45821",
  totalBalance: 48750,
  insurancePaid: 215400,
  patientResponsibility: 48750,
  propensityScore: "high",
  propensityPercentage: 82,
}

export interface Transaction {
  id: string
  date: string
  description: string
  serviceDate: string
  amount: number
  type: "payment" | "charge" | "adjustment"
  status: "completed" | "pending" | "failed"
}

const transactions: Transaction[] = [
  {
    id: "TXN-001",
    date: "May 10, 2026",
    description: "Online Payment - Credit Card",
    serviceDate: "April 25, 2026",
    amount: 15000,
    type: "payment",
    status: "completed",
  },
  {
    id: "TXN-002",
    date: "May 5, 2026",
    description: "Orthopedic Consultation",
    serviceDate: "May 5, 2026",
    amount: 8500,
    type: "charge",
    status: "completed",
  },
  {
    id: "TXN-003",
    date: "April 28, 2026",
    description: "Insurance Adjustment",
    serviceDate: "April 15, 2026",
    amount: -3200,
    type: "adjustment",
    status: "completed",
  },
  {
    id: "TXN-004",
    date: "April 20, 2026",
    description: "Online Payment - UPI",
    serviceDate: "April 10, 2026",
    amount: 25000,
    type: "payment",
    status: "completed",
  },
  {
    id: "TXN-005",
    date: "April 15, 2026",
    description: "Lab Work - Complete Blood Count",
    serviceDate: "April 15, 2026",
    amount: 4500,
    type: "charge",
    status: "completed",
  },
  {
    id: "TXN-006",
    date: "April 10, 2026",
    description: "MRI Scan - Right Knee",
    serviceDate: "April 10, 2026",
    amount: 18000,
    type: "charge",
    status: "completed",
  },
]

export default function PatientPortalPage() {
  const [isStaffView, setIsStaffView] = useState(true)

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <PatientHeader 
          patient={patientData} 
          isStaffView={isStaffView}
          onToggleView={() => setIsStaffView(!isStaffView)}
        />
        
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Top Row - Balance and Propensity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <BalanceCard patient={patientData} />
              </div>
              {isStaffView && (
                <div>
                  <PropensityScore patient={patientData} />
                </div>
              )}
            </div>

            {/* Payment Plans */}
            <PaymentPlans balance={patientData.patientResponsibility} />

            {/* Transaction History */}
            <TransactionHistory transactions={transactions} />
          </div>
        </div>

        {/* AI Chat */}
        <AIChat />
      </div>
    </DashboardLayout>
  )
}
