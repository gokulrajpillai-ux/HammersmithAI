"use client"

import { toast } from "sonner"
import { ShoppingCart, X, Send, CheckCircle, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import type { CodeSuggestion } from "@/app/medical-coding/page"

interface CodeBasketProps {
  confirmedCodes: CodeSuggestion[]
  onRemove: (id: string) => void
}

export function CodeBasket({ confirmedCodes, onRemove }: CodeBasketProps) {
  // Calculate clean claim probability based on code confidence
  const avgConfidence = confirmedCodes.length > 0
    ? Math.round(confirmedCodes.reduce((sum, c) => sum + c.confidence, 0) / confirmedCodes.length)
    : 0
  
  // Adjust for number of codes and types
  const hasICD = confirmedCodes.some(c => c.codeType === "ICD-10")
  const hasCPT = confirmedCodes.some(c => c.codeType === "CPT")
  const codeTypeBonus = hasICD && hasCPT ? 5 : 0
  const cleanClaimProbability = Math.min(100, avgConfidence + codeTypeBonus)

  const getCleanClaimColor = (prob: number) => {
    if (prob >= 90) return "text-success"
    if (prob >= 75) return "text-warning"
    return "text-destructive"
  }

  const handleSubmitClaim = () => {
    if (confirmedCodes.length === 0) {
      toast.error("No Codes Selected", {
        description: "Please confirm at least one code before submitting.",
      })
      return
    }
    toast.success("Claim Submitted", {
      description: `${confirmedCodes.length} codes submitted for claim processing.`,
    })
  }

  const handleRemove = (code: CodeSuggestion) => {
    onRemove(code.id)
    toast.info("Code Removed", {
      description: `${code.code} removed from claim code list.`,
    })
  }

  return (
    <Card className="bg-card border-border shrink-0">
      <CardHeader className="border-b border-border py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ShoppingCart className="size-4 text-primary" />
            Final Claim Codes
            <Badge variant="secondary" className="text-xs">
              {confirmedCodes.length} codes
            </Badge>
          </CardTitle>
          
          {/* Clean Claim Probability */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Clean Claim Probability:</span>
              <span className={`text-lg font-bold ${getCleanClaimColor(cleanClaimProbability)}`}>
                {confirmedCodes.length > 0 ? `${cleanClaimProbability}%` : "—"}
              </span>
            </div>
            <Button 
              size="sm" 
              className="gap-2"
              onClick={handleSubmitClaim}
              disabled={confirmedCodes.length === 0}
            >
              <Send className="size-4" />
              Submit Claim
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {confirmedCodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle className="size-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              No codes confirmed yet. Review and confirm AI suggestions above.
            </p>
          </div>
        ) : (
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2">
              {confirmedCodes.map((code) => (
                <div
                  key={code.id}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 border border-success/30"
                >
                  <Badge variant="outline" className="text-xs font-mono shrink-0">
                    {code.codeType}
                  </Badge>
                  <span className="font-mono font-semibold text-sm text-foreground">
                    {code.modifiedCode || code.code}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-5 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemove(code)}
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
