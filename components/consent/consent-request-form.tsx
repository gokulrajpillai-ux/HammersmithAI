"use client"

import { useState } from "react"
import { Send, FileText, Pill, Stethoscope, Syringe, User } from "lucide-react"
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
  { value: "1day", label: "1 Day" },
  { value: "3days", label: "3 Days" },
  { value: "discharge", label: "Until Discharge" },
  { value: "1week", label: "1 Week" },
  { value: "1month", label: "1 Month" },
]

export function ConsentRequestForm() {
  const [abhaAddress, setAbhaAddress] = useState("")
  const [selectedRecords, setSelectedRecords] = useState<string[]>([])
  const [purpose, setPurpose] = useState("")
  const [duration, setDuration] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRecordToggle = (id: string) => {
    setSelectedRecords(prev => 
      prev.includes(id) 
        ? prev.filter(r => r !== id) 
        : [...prev, id]
    )
  }

  const handleSubmit = () => {
    if (!abhaAddress || selectedRecords.length === 0 || !purpose || !duration) {
      toast.error("Missing Information", {
        description: "Please fill in all required fields"
      })
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success("Consent Request Sent", {
        description: "Patient will receive notification on their ABHA App"
      })
      setAbhaAddress("")
      setSelectedRecords([])
      setPurpose("")
      setDuration("")
    }, 1500)
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
              <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Sending Request...
            </>
          ) : (
            <>
              <Send className="size-4" />
              Send Consent Request
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
