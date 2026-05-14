"use client"

import { useState } from "react"
import { Search, Smartphone, CreditCard, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

interface ABHASearchProps {
  onSubmit: (value: string) => void
}

export function ABHASearch({ onSubmit }: ABHASearchProps) {
  const [abhaId, setAbhaId] = useState("")
  const [mobile, setMobile] = useState("")
  const [abhaAddress, setAbhaAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const formatAbhaId = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 14)
    const parts = []
    if (digits.length > 0) parts.push(digits.slice(0, 2))
    if (digits.length > 2) parts.push(digits.slice(2, 6))
    if (digits.length > 6) parts.push(digits.slice(6, 10))
    if (digits.length > 10) parts.push(digits.slice(10, 14))
    return parts.join("-")
  }

  const handleAbhaIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAbhaId(formatAbhaId(e.target.value))
  }

  const handleSubmit = (type: "abha" | "mobile" | "address") => {
    let value = ""
    if (type === "abha" && abhaId.replace(/-/g, "").length === 14) {
      value = abhaId
    } else if (type === "mobile" && mobile.length === 10) {
      value = mobile
    } else if (type === "address" && abhaAddress.includes("@")) {
      value = abhaAddress
    } else {
      toast.error("Invalid Input", {
        description: type === "abha" 
          ? "Please enter a valid 14-digit ABHA ID"
          : type === "mobile"
          ? "Please enter a valid 10-digit mobile number"
          : "Please enter a valid ABHA address (e.g., name@abdm)"
      })
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onSubmit(value)
    }, 1000)
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="size-5 text-emerald-500" />
          Search / Link ABHA
        </CardTitle>
        <CardDescription>
          Enter the patient&apos;s ABHA ID, mobile number, or ABHA address to verify and link their health records
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="abha" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="abha" className="gap-2">
              <CreditCard className="size-4" />
              <span className="hidden sm:inline">ABHA ID</span>
            </TabsTrigger>
            <TabsTrigger value="mobile" className="gap-2">
              <Smartphone className="size-4" />
              <span className="hidden sm:inline">Mobile</span>
            </TabsTrigger>
            <TabsTrigger value="address" className="gap-2">
              <span className="font-mono text-xs">@</span>
              <span className="hidden sm:inline">ABHA Address</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="abha" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">14-Digit ABHA Number</label>
              <div className="flex gap-3">
                <Input
                  placeholder="XX-XXXX-XXXX-XXXX"
                  value={abhaId}
                  onChange={handleAbhaIdChange}
                  className="font-mono text-lg tracking-wider"
                  maxLength={17}
                />
                <Button 
                  onClick={() => handleSubmit("abha")}
                  disabled={isLoading || abhaId.replace(/-/g, "").length !== 14}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  {isLoading ? (
                    <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Verify
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                The ABHA number is a 14-digit unique identifier issued under Ayushman Bharat Digital Mission
              </p>
            </div>
          </TabsContent>

          <TabsContent value="mobile" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Registered Mobile Number</label>
              <div className="flex gap-3">
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                    +91
                  </span>
                  <Input
                    placeholder="9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="rounded-l-none font-mono text-lg"
                    maxLength={10}
                  />
                </div>
                <Button 
                  onClick={() => handleSubmit("mobile")}
                  disabled={isLoading || mobile.length !== 10}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  {isLoading ? (
                    <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Verify
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the mobile number linked to the patient&apos;s Aadhaar for OTP verification
              </p>
            </div>
          </TabsContent>

          <TabsContent value="address" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">ABHA Address</label>
              <div className="flex gap-3">
                <Input
                  placeholder="username@abdm"
                  value={abhaAddress}
                  onChange={(e) => setAbhaAddress(e.target.value.toLowerCase())}
                  className="font-mono"
                />
                <Button 
                  onClick={() => handleSubmit("address")}
                  disabled={isLoading || !abhaAddress.includes("@")}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  {isLoading ? (
                    <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Verify
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                The ABHA address is a unique health ID like an email (e.g., patient.name@abdm)
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
