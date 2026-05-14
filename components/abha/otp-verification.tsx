"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Shield, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface OTPVerificationProps {
  identifier: string
  onVerified: () => void
  onBack: () => void
}

export function OTPVerification({ identifier, onVerified, onBack }: OTPVerificationProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(30)
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

  const handleVerify = () => {
    const otpValue = otp.join("")
    if (otpValue.length !== 6) {
      toast.error("Invalid OTP", {
        description: "Please enter the complete 6-digit OTP"
      })
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast.success("Verification Successful", {
        description: "Patient identity verified via Aadhaar-linked OTP"
      })
      onVerified()
    }, 1500)
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
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
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
              className="size-12 sm:size-14 text-center text-xl font-mono"
            />
          ))}
        </div>

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
