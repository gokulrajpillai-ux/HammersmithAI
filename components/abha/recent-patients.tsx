"use client"

import { Clock, User, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { PatientData } from "@/app/abha-onboarding/page"

interface RecentPatientsProps {
  onSelect: (patient: PatientData) => void
}

const recentPatients: PatientData[] = [
  {
    abhaId: "91-2345-6789-0123",
    abhaAddress: "rajesh.kumar@abdm",
    name: "Rajesh Kumar",
    gender: "Male",
    dob: "22-03-1985",
    mobile: "9876543210",
  },
  {
    abhaId: "91-3456-7890-1234",
    abhaAddress: "priya.sharma@abdm",
    name: "Priya Sharma",
    gender: "Female",
    dob: "10-11-1990",
    mobile: "8765432109",
  },
  {
    abhaId: "91-4567-8901-2345",
    abhaAddress: "amit.patel@abdm",
    name: "Amit Patel",
    gender: "Male",
    dob: "05-07-1978",
    mobile: "7654321098",
  },
]

export function RecentPatients({ onSelect }: RecentPatientsProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="size-4 text-muted-foreground" />
          Recently Linked
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {recentPatients.map((patient) => (
          <Button
            key={patient.abhaId}
            variant="ghost"
            className="w-full justify-start h-auto p-3 hover:bg-muted"
            onClick={() => onSelect(patient)}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <User className="size-5 text-emerald-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-sm">{patient.name}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {patient.abhaAddress}
                </p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
