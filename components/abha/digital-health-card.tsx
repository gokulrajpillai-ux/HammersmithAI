"use client"

import { CheckCircle, User, Calendar, Smartphone, Copy, Plus, FileText, Download, QrCode } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { PatientData } from "@/app/abha-onboarding/page"

interface DigitalHealthCardProps {
  patient: PatientData
  onReset: () => void
}

export function DigitalHealthCard({ patient, onReset }: DigitalHealthCardProps) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied!", { description: `${label} copied to clipboard` })
  }

  const handleDownloadPDF = () => {
    toast.success("Generating PDF", {
      description: "Your ABHA Health Card PDF is being generated..."
    })
    // Simulate PDF generation
    setTimeout(() => {
      toast.success("PDF Ready", {
        description: "ABHA Health Card downloaded successfully"
      })
    }, 1500)
  }

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      <div className="flex items-center gap-3 p-4 rounded-lg bg-teal-500/10 border border-teal-500/20">
        <CheckCircle className="size-6 text-teal-500" />
        <div>
          <p className="font-medium text-teal-500">Patient Successfully Verified</p>
          <p className="text-sm text-muted-foreground">ABHA linked to this healthcare facility</p>
        </div>
      </div>

      {/* Digital Health Card */}
      <Card className="bg-gradient-to-br from-teal-600 to-emerald-700 border-0 overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        <CardContent className="p-6 relative">
          {/* Header with QR Code */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white font-bold text-lg">आ</span>
              </div>
              <div>
                <p className="text-white/80 text-xs uppercase tracking-wider">Ayushman Bharat</p>
                <p className="text-white font-semibold">Digital Health Card</p>
              </div>
            </div>
            {/* QR Code Placeholder */}
            <div className="flex flex-col items-center gap-1">
              <div className="size-16 rounded-lg bg-white flex items-center justify-center">
                <QrCode className="size-12 text-teal-700" />
              </div>
              <span className="text-white/60 text-[10px]">Scan to verify</span>
            </div>
          </div>

          {/* Patient Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-lg bg-white/20 flex items-center justify-center">
                <User className="size-8 text-white" />
              </div>
              <div>
                <p className="text-white text-xl font-semibold">{patient.name}</p>
                <p className="text-white/70 text-sm">{patient.gender}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white/60 text-xs uppercase">ABHA Number</p>
                <div className="flex items-center gap-2">
                  <p className="text-white font-mono">{patient.abhaId}</p>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="size-6 text-white/70 hover:text-white hover:bg-white/10"
                    onClick={() => copyToClipboard(patient.abhaId, "ABHA Number")}
                  >
                    <Copy className="size-3" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-white/60 text-xs uppercase">ABHA Address</p>
                <div className="flex items-center gap-2">
                  <p className="text-white font-mono text-sm">{patient.abhaAddress}</p>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="size-6 text-white/70 hover:text-white hover:bg-white/10"
                    onClick={() => copyToClipboard(patient.abhaAddress, "ABHA Address")}
                  >
                    <Copy className="size-3" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-white/60" />
                <div>
                  <p className="text-white/60 text-xs">Date of Birth</p>
                  <p className="text-white text-sm">{patient.dob}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="size-4 text-white/60" />
                <div>
                  <p className="text-white/60 text-xs">Mobile</p>
                  <p className="text-white text-sm">{patient.mobile}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-0 hover:bg-white/30">
                ABDM Verified
              </Badge>
            </div>
            <p className="text-white/60 text-xs">Government of India</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 gap-2" onClick={onReset}>
          <Plus className="size-4" />
          Link Another Patient
        </Button>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={handleDownloadPDF}
        >
          <Download className="size-4" />
          Download PDF
        </Button>
        <Button className="flex-1 gap-2 bg-teal-600 hover:bg-teal-700">
          <FileText className="size-4" />
          Start Registration
        </Button>
      </div>

      {/* Compliance Footer - DPDP Act & ABDM Guidelines */}
      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <div className="flex items-start gap-3">
          <CheckCircle className="size-5 text-teal-500 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Compliance Verified</p>
            <p className="text-xs text-muted-foreground">
              Processed under <span className="font-medium">DPDP Act 2023</span> & <span className="font-medium">ABDM M1 Guidelines</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Patient data is encrypted and stored in accordance with National Digital Health Mission standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
