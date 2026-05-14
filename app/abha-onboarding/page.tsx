"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { ABHAHeader } from "@/components/abha/header"
import { ABHASearch } from "@/components/abha/abha-search"
import { OTPVerification } from "@/components/abha/otp-verification"
import { DigitalHealthCard } from "@/components/abha/digital-health-card"
import { RecentPatients } from "@/components/abha/recent-patients"
import { useState } from "react"

export interface PatientData {
  abhaId: string
  abhaAddress: string
  name: string
  gender: string
  dob: string
  mobile: string
  photo?: string
}

export default function ABHAOnboardingPage() {
  const [step, setStep] = useState<"search" | "otp" | "verified">("search")
  const [searchValue, setSearchValue] = useState("")
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [verifiedPatient, setVerifiedPatient] = useState<PatientData | null>(null)

  const handleSearchSubmit = (value: string, txnId: string) => {
    setSearchValue(value)
    setTransactionId(txnId)
    setStep("otp")
  }

  const handleOTPVerified = (txnId: string) => {
    // Verify transaction ID matches for secure backend handshake
    if (txnId !== transactionId) {
      console.error("[v0] Transaction ID mismatch - potential security issue")
      return
    }
    
    // Mock patient data after OTP verification
    setVerifiedPatient({
      abhaId: "91-1234-5678-9012",
      abhaAddress: "ananya.reddy@abdm",
      name: "Ananya Reddy",
      gender: "Female",
      dob: "15-08-1992",
      mobile: searchValue.includes("@") ? "98765xxxxx" : searchValue,
    })
    setStep("verified")
  }

  const handleReset = () => {
    setStep("search")
    setSearchValue("")
    setTransactionId(null)
    setVerifiedPatient(null)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 md:ml-64">
        <ABHAHeader />
        <div className="p-4 lg:p-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content - Left 2/3 */}
            <div className="lg:col-span-2 space-y-6">
              {step === "search" && (
                <ABHASearch onSubmit={handleSearchSubmit} />
              )}
              {step === "otp" && transactionId && (
                <OTPVerification 
                  identifier={searchValue}
                  transactionId={transactionId}
                  onVerified={handleOTPVerified}
                  onBack={() => setStep("search")}
                />
              )}
              {step === "verified" && verifiedPatient && (
                <DigitalHealthCard 
                  patient={verifiedPatient} 
                  onReset={handleReset}
                />
              )}
            </div>
            
            {/* Sidebar - Right 1/3 */}
            <div className="space-y-6">
              <RecentPatients onSelect={(patient) => {
                setVerifiedPatient(patient)
                setStep("verified")
              }} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
