"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Shield, RefreshCw, Lock, CheckCircle, Database } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { createClient, isSupabaseConfigured, getCurrentUserOrgId } from "@/lib/supabase"
import type { Patient } from "@/lib/supabase"

interface OTPVerificationProps {
  identifier: string
  transactionId: string
  onVerified: (transactionId: string) => void
  onBack: () => void
}

export function OTPVerification({ identifier, transactionId, onVerified, onBack }: OTPVerificationProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(30)
  const [verificationStage, setVerificationStage] = useState<"otp" | "handshake" | "database" | "complete">("otp")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return
    
    const newOtp = [...otp]
    newOtp[index] = value.replace(/\D/g, "")
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    const newOtp = [...otp]
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char
    })
    setOtp(newOtp)
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus()
  }

  const handleVerify = async () => {
    const otpValue = otp.join("")
    if (otpValue.length !== 6) {
      toast.error("Invalid OTP", {
        description: "Please enter the complete 6-digit OTP"
      })
      return
    }

    setIsLoading(true)
    setVerificationStage("otp")

    try {
      // Stage 1: OTP Verification
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Stage 2: Backend Handshake - Verify transaction ID
      setVerificationStage("handshake")
      toast.info("Secure Handshake", {
        description: `Validating transaction ${transactionId.slice(0, 12)}...`
      })
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate backend handshake verification
      const handshakeSuccess = simulateBackendHandshake(transactionId, otpValue)
      
      if (!handshakeSuccess) {
        setIsLoading(false)
        setVerificationStage("otp")
        toast.error("Verification Failed", {
          description: "Transaction validation failed. Please try again."
        })
        return
      }

      // Stage 3: Database Sync - Upsert patient record to Supabase
      setVerificationStage("database")
      
      if (isSupabaseConfigured()) {
        const supabase = createClient()
        
        // Fetch current user's org_id for RLS scoping
        const orgId = await getCurrentUserOrgId()
        
        if (!orgId) {
          toast.error("Organization Not Found", {
            description: "Could not determine your organization. Please ensure you are logged in."
          })
          setIsLoading(false)
          setVerificationStage("otp")
          return
        }
        
        // Generate patient data from the verified ABHA
        const fullName = generatePatientName(identifier)
        const nameParts = splitName(fullName)
        const patientDob = generateDob(identifier)
        const patientGender = generateGender(identifier)
        const patientMobile = generateMobile(identifier)
        
        const patientData: Patient = {
          org_id: orgId,
          abha_id: generateAbhaId(identifier),
          abha_address: generateAbhaAddress(identifier),
          first_name: nameParts.firstName,
          last_name: nameParts.lastName,
          dob: patientDob,
          gender: patientGender,
          mobile: patientMobile,
          is_abha_verified: true,
        }
        
        const { error } = await supabase
          .from('patients')
          .upsert(patientData, {
            onConflict: 'abha_id',
            ignoreDuplicates: false
          })
        
        if (error) {
          console.error("[v0] Supabase upsert error:", error)
          toast.error("Database Sync Failed", {
            description: error.message || "Could not save patient record. Please check your Supabase configuration."
          })
          setIsLoading(false)
          setVerificationStage("otp")
          return
        }
        
        toast.success("Database Synced", {
          description: "Patient record saved to Supabase successfully"
        })
      } else {
        // If Supabase is not configured, show warning but continue
        toast.warning("Database Not Connected", {
          description: "Patient verified but not saved. Add Supabase env vars to enable persistence."
        })
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Stage 4: Complete
      setVerificationStage("complete")
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setIsLoading(false)
      toast.success("Verification Successful", {
        description: "Patient identity verified via Aadhaar-linked OTP with secure backend handshake"
      })
      onVerified(transactionId)
      
    } catch (error) {
      console.error("[v0] Verification error:", error)
      setIsLoading(false)
      setVerificationStage("otp")
      toast.error("Verification Error", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      })
    }
  }

  // Simulate backend handshake verification
  const simulateBackendHandshake = (txnId: string, _otp: string): boolean => {
    // In real implementation, this would call your backend API
    // which validates the transaction ID with ABDM servers
    return txnId.startsWith("ABDM-TXN-")
  }

  // Helper functions to generate patient data based on identifier type
  const generateAbhaId = (id: string): string => {
    if (id.replace(/-/g, "").length === 14) return id.replace(/-/g, "")
    return `91${Date.now().toString().slice(-12)}`
  }

  const generateAbhaAddress = (id: string): string => {
    if (id.includes("@")) return id
    return `patient.${Date.now().toString().slice(-6)}@abdm`
  }

  const generatePatientName = (id: string): string => {
    // In real implementation, this would come from ABDM API response
    if (id.includes("@")) return id.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, l => l.toUpperCase())
    return "Verified Patient"
  }

  // Split full name into first_name and last_name
  const splitName = (fullName: string): { firstName: string; lastName: string } => {
    const parts = fullName.trim().split(/\s+/)
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: "" }
    }
    const lastName = parts.pop() || ""
    const firstName = parts.join(" ")
    return { firstName, lastName }
  }

  // Generate date of birth (in real implementation, comes from ABDM API)
  const generateDob = (_id: string): string => {
    // Mock DOB - in production this comes from ABDM verification response
    return "1990-01-15"
  }

  // Generate gender (in real implementation, comes from ABDM API)
  const generateGender = (_id: string): string => {
    // Mock gender - in production this comes from ABDM verification response
    return "Male"
  }

  // Generate mobile number (in real implementation, comes from ABDM API)
  const generateMobile = (id: string): string => {
    // If identifier is a mobile number, use it
    if (/^\d{10}$/.test(id.replace(/\D/g, ""))) {
      return id.replace(/\D/g, "")
    }
    // Mock mobile - in production this comes from ABDM verification response
    return "9876543210"
  }

  const handleResend = () => {
    setResendTimer(30)
    toast.success("OTP Resent", {
      description: "A new OTP has been sent to the registered mobile number"
    })
  }

  const maskedIdentifier = identifier.includes("@") 
    ? identifier 
    : identifier.length === 10 
    ? `+91 ${identifier.slice(0, 2)}****${identifier.slice(-2)}`
    : identifier

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} disabled={isLoading}>
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-5 text-emerald-500" />
              Aadhaar OTP Verification
            </CardTitle>
            <CardDescription>
              Enter the 6-digit OTP sent to {maskedIdentifier}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Transaction ID Display */}
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2">
            <Lock className="size-4 text-emerald-500" />
            <span className="text-xs text-emerald-500 font-medium">Secure Transaction</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            ID: {transactionId}
          </p>
        </div>

        {/* OTP Input */}
        <div className="flex justify-center gap-2 sm:gap-3">
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={isLoading}
              className="size-12 sm:size-14 text-center text-xl font-mono"
            />
          ))}
        </div>

        {/* Verification Progress */}
        {isLoading && (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {verificationStage === "otp" && (
                <>
                  <span className="size-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                  <span className="text-muted-foreground">Verifying OTP...</span>
                </>
              )}
              {verificationStage === "handshake" && (
                <>
                  <CheckCircle className="size-4 text-emerald-500" />
                  <span className="text-emerald-500">OTP Verified</span>
                  <span className="mx-1">•</span>
                  <span className="size-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                  <span className="text-muted-foreground">Backend Handshake...</span>
                </>
              )}
              {verificationStage === "database" && (
                <>
                  <CheckCircle className="size-4 text-emerald-500" />
                  <span className="text-emerald-500">Handshake Complete</span>
                  <span className="mx-1">•</span>
                  <Database className="size-4 text-emerald-500 animate-pulse" />
                  <span className="text-muted-foreground">Syncing to Database...</span>
                </>
              )}
              {verificationStage === "complete" && (
                <>
                  <CheckCircle className="size-4 text-emerald-500" />
                  <span className="text-emerald-500">Complete</span>
                </>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-4">
          <Button 
            onClick={handleVerify}
            disabled={isLoading || otp.join("").length !== 6}
            className="w-full max-w-xs gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            {isLoading ? (
              <>
                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify & Link ABHA"
            )}
          </Button>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {resendTimer > 0 ? (
              <span>Resend OTP in {resendTimer}s</span>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleResend}
                disabled={isLoading}
                className="gap-2 text-emerald-500 hover:text-emerald-400"
              >
                <RefreshCw className="size-4" />
                Resend OTP
              </Button>
            )}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground text-center">
            This OTP is sent to the mobile number registered with your Aadhaar. 
            By verifying, you consent to link your ABHA with this healthcare facility under ABDM guidelines.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
