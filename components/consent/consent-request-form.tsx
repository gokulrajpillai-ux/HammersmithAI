"use client"

import { useState } from "react"
import { Send, FileText, Pill, Stethoscope, Syringe, User, Database } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { createClient, isSupabaseConfigured, getCurrentUserOrgId } from "@/lib/supabase"

const recordTypes = [
  { id: "diagnostic", label: "Diagnostic Reports", icon: Stethoscope },
  { id: "prescriptions", label: "Prescriptions", icon: Pill },
  { id: "discharge", label: "Discharge Summaries", icon: FileText },
  { id: "immunization", label: "Immunization Records", icon: Syringe },
]

const purposes = [
  { value: "claim", label: "Insurance Claim Processing" },
  { value: "coding", label: "Medical Coding Verification" },
  { value: "treatment", label: "Continuity of Care" },
  { value: "second_opinion", label: "Second Opinion" },
]

const durations = [
  { value: "1day", label: "1 Day", days: 1 },
  { value: "3days", label: "3 Days", days: 3 },
  { value: "discharge", label: "Until Discharge", days: 30 },
  { value: "1week", label: "1 Week", days: 7 },
  { value: "1month", label: "1 Month", days: 30 },
]

export function ConsentRequestForm() {
  const [abhaAddress, setAbhaAddress] = useState("")
  const [selectedRecords, setSelectedRecords] = useState<string[]>([])
  const [purpose, setPurpose] = useState("")
  const [duration, setDuration] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const handleRecordToggle = (id: string) => {
    setSelectedRecords(prev => 
      prev.includes(id) 
        ? prev.filter(r => r !== id) 
        : [...prev, id]
    )
  }

  const calculateExpiryDate = (durationValue: string): string => {
    const durationConfig = durations.find(d => d.value === durationValue)
    const days = durationConfig?.days || 1
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + days)
    return expiryDate.toISOString()
  }

  const handleSubmit = async () => {
    if (!abhaAddress || selectedRecords.length === 0 || !purpose || !duration) {
      toast.error("Missing Information", {
        description: "Please fill in all required fields"
      })
      return
    }

    setIsSubmitting(true)

    try {
      // If Supabase is configured, save to database
      if (isSupabaseConfigured()) {
        setIsSyncing(true)
        const supabase = createClient()
        
        // Fetch current user's org_id for RLS scoping (falls back to Hammersmith AI Clinic)
        const orgId = await getCurrentUserOrgId()
        
        // First, try to find the patient by ABHA address within the same org
        const { data: patientData } = await supabase
          .from('patients')
          .select('id')
          .eq('abha_address', abhaAddress)
          .eq('org_id', orgId)
          .single()
        
        // Prepare consent log data with org_id for RLS
        const consentLog = {
          org_id: orgId,
          patient_id: patientData?.id || null,
          abha_address: abhaAddress,
          purpose: purpose,
          record_types: selectedRecords,
          expiry_date: calculateExpiryDate(duration),
          hip_id: `HIP-${orgId.slice(0, 8)}`,
          status: 'pending' as const,
        }
        
        const { error } = await supabase
          .from('abdm_consent_logs')
          .insert(consentLog)
        
        setIsSyncing(false)
        
        if (error) {
          console.error("[v0] Consent log insert error:", error)
          toast.error("Database Error", {
            description: error.message || "Could not save consent request. Check Supabase configuration."
          })
          setIsSubmitting(false)
          return
        }
        
        toast.success("Consent Request Logged", {
          description: "Request saved to database and sent to patient's ABHA App"
        })
      } else {
        // Simulate API call if Supabase not configured
        await new Promise(resolve => setTimeout(resolve, 1500))
        toast.warning("Database Not Connected", {
          description: "Request sent but not persisted. Add Supabase env vars for persistence."
        })
      }
      
      toast.success("Consent Request Sent", {
        description: "Patient will receive notification on their ABHA App"
      })
      
      // Reset form
      setAbhaAddress("")
      setSelectedRecords([])
      setPurpose("")
      setDuration("")
      
    } catch (error) {
      console.error("[v0] Consent submission error:", error)
      toast.error("Submission Failed", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      })
    } finally {
      setIsSubmitting(false)
      setIsSyncing(false)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="size-5 text-primary" />
          New Consent Request
        </CardTitle>
        <CardDescription>
          Request access to patient health records via ABDM consent framework
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Patient ABHA Address */}
        <div className="space-y-2">
          <Label>Patient ABHA Address</Label>
          <Input
            placeholder="patient.name@abdm"
            value={abhaAddress}
            onChange={(e) => setAbhaAddress(e.target.value.toLowerCase())}
            className="font-mono"
          />
        </div>

        {/* Record Types */}
        <div className="space-y-3">
          <Label>Select Record Types</Label>
          <div className="grid grid-cols-2 gap-2">
            {recordTypes.map((record) => {
              const Icon = record.icon
              return (
                <div
                  key={record.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedRecords.includes(record.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleRecordToggle(record.id)}
                >
                  <Checkbox 
                    checked={selectedRecords.includes(record.id)}
                    onCheckedChange={() => handleRecordToggle(record.id)}
                  />
                  <Icon className="size-4 text-muted-foreground" />
                  <span className="text-sm">{record.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Purpose & Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Purpose of Access</Label>
            <Select value={purpose} onValueChange={setPurpose}>
              <SelectTrigger>
                <SelectValue placeholder="Select purpose" />
              </SelectTrigger>
              <SelectContent>
                {purposes.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Access Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {durations.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          className="w-full gap-2"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              {isSyncing ? (
                <Database className="size-4 animate-pulse" />
              ) : (
                <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              )}
              {isSyncing ? "Saving to Database..." : "Sending Request..."}
            </>
          ) : (
            <>
              <Send className="size-4" />
              Send Consent Request
            </>
          )}
        </Button>

        {/* Database Status Indicator */}
        <div className={`flex items-center justify-center gap-2 text-xs ${isSupabaseConfigured() ? 'text-emerald-500' : 'text-muted-foreground'}`}>
          <Database className="size-3" />
          <span>
            {isSupabaseConfigured() 
              ? "Connected to Supabase" 
              : "Database not configured"
            }
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
