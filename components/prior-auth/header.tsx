"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Plus, ChevronRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function PriorAuthHeader() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNewRequest = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setDialogOpen(false)
      toast.success("Authorization Request Created", {
        description: "New request AUTH-2024-1893 has been added to the queue for AI review.",
      })
    }, 1500)
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur px-4 md:px-6">
      <div className="flex items-center gap-4 pl-12 md:pl-0">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                <Home className="size-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="size-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium">Prior Authorization</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="size-4" />
            <span className="hidden sm:inline">New Auth Request</span>
            <span className="sm:hidden">New</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Authorization Request</DialogTitle>
            <DialogDescription>
              Enter patient and procedure details to initiate a prior authorization request.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="mrn">Patient MRN</Label>
              <Input id="mrn" placeholder="MRN-XXXXXX" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payer">Insurance Payer</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select payer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="star">Star Health Insurance</SelectItem>
                  <SelectItem value="hdfc">HDFC ERGO</SelectItem>
                  <SelectItem value="icici">ICICI Lombard</SelectItem>
                  <SelectItem value="max">Max Bupa</SelectItem>
                  <SelectItem value="bajaj">Bajaj Allianz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cpt">Procedure Code (CPT)</Label>
              <Input id="cpt" placeholder="CPT-XXXXX" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc">Procedure Description</Label>
              <Input id="desc" placeholder="e.g., Total Knee Arthroplasty" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleNewRequest} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
