"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Shield, RefreshCw, Lock, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

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
  const [verificationStage, setVerificationStage] = useState<"otp" | "handshake" | "complete">("otp")
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

    // Stage 3: Complete
    setVerificationStage("complete")
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setIsLoading(false)
    toast.success("Verification Successful", {
      description: "Patient identity verified via Aadhaar-linked OTP with secure backend handshake"
    })
    onVerified(transactionId)
  }

  // Simulate backend handshake verification
  const simulateBackendHandshake = (txnId: string, _otp: string): boolean => {
    // In real implementation, this would call your backend API
    // which validates the transaction ID with ABDM servers
    return txnId.startsWith("ABDM-TXN-")
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
              <Shield className="size-5 text-teal-500" />
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
        <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/20">
          <div className="flex items-center gap-2">
            <Lock className="size-4 text-teal-500" />
            <span className="text-xs text-teal-500 font-medium">Secure Transaction</span>
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
            <div className="flex items-center gap-2 text-sm">
              {verificationStage === "otp" && (
                <>
                  <span className="size-4 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                  <span className="text-muted-foreground">Verifying OTP...</span>
                </>
              )}
              {verificationStage === "handshake" && (
                <>
                  <CheckCircle className="size-4 text-teal-500" />
                  <span className="text-teal-500">OTP Verified</span>
                  <span className="mx-2">•</span>
                  <span className="size-4 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                  <span className="text-muted-foreground">Backend Handshake...</span>
                </>
              )}
              {verificationStage === "complete" && (
                <>
                  <CheckCircle className="size-4 text-teal-500" />
                  <span className="text-teal-500">Complete</span>
                </>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-4">
          <Button 
            onClick={handleVerify}
            disabled={isLoading || otp.join("").length !== 6}
            className="w-full max-w-xs gap-2 bg-teal-600 hover:bg-teal-700"
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
                className="gap-2 text-teal-500 hover:text-teal-400"
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
