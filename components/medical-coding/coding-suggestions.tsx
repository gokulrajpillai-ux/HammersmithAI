"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Sparkles, Check, X, Edit3, ChevronDown, ChevronUp, Quote, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type { CodeSuggestion } from "@/app/medical-coding/page"

interface CodingSuggestionsProps {
  suggestions: CodeSuggestion[]
  onConfirm: (id: string) => void
  onReject: (id: string) => void
  onModify: (id: string, newCode: string) => void
  onHover: (id: string | null) => void
  selectedPhraseId: string | null
}

export function CodingSuggestions({ 
  suggestions, 
  onConfirm, 
  onReject, 
  onModify, 
  onHover,
  selectedPhraseId 
}: CodingSuggestionsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  const pendingSuggestions = suggestions.filter(s => s.status === "pending")
  const processedSuggestions = suggestions.filter(s => s.status !== "pending")

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return "text-success"
    if (confidence >= 70) return "text-warning"
    return "text-destructive"
  }

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 85) return "bg-success/10 border-success/30"
    if (confidence >= 70) return "bg-warning/10 border-warning/30"
    return "bg-destructive/10 border-destructive/30"
  }

  const handleConfirm = (suggestion: CodeSuggestion) => {
    onConfirm(suggestion.id)
    toast.success("Code Confirmed", {
      description: `${suggestion.code} added to claim code list.`,
    })
  }

  const handleReject = (suggestion: CodeSuggestion) => {
    onReject(suggestion.id)
    toast.info("Code Rejected", {
      description: `${suggestion.code} has been rejected.`,
    })
  }

  const handleStartEdit = (suggestion: CodeSuggestion) => {
    setEditingId(suggestion.id)
    setEditValue(suggestion.code)
  }

  const handleSaveEdit = (suggestion: CodeSuggestion) => {
    if (editValue.trim() && editValue !== suggestion.code) {
      onModify(suggestion.id, editValue.trim())
      toast.success("Code Modified", {
        description: `Changed from ${suggestion.code} to ${editValue.trim()}.`,
      })
    }
    setEditingId(null)
    setEditValue("")
  }

  const renderSuggestionCard = (suggestion: CodeSuggestion) => {
    const isExpanded = expandedId === suggestion.id
    const isEditing = editingId === suggestion.id
    const isSelected = selectedPhraseId === suggestion.id

    return (
      <Collapsible
        key={suggestion.id}
        open={isExpanded}
        onOpenChange={() => setExpandedId(isExpanded ? null : suggestion.id)}
      >
        <Card 
          className={`border transition-all ${
            isSelected ? "border-primary ring-2 ring-primary/20" : "border-border"
          } ${suggestion.status !== "pending" ? "opacity-60" : ""}`}
          onMouseEnter={() => onHover(suggestion.id)}
          onMouseLeave={() => onHover(null)}
        >
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs font-mono">
                    {suggestion.codeType}
                  </Badge>
                  {isEditing ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="h-6 w-32 text-sm font-mono"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(suggestion)
                        if (e.key === "Escape") setEditingId(null)
                      }}
                      autoFocus
                    />
                  ) : (
                    <span className="font-mono font-semibold text-foreground">
                      {suggestion.modifiedCode || suggestion.code}
                    </span>
                  )}
                  {suggestion.status === "modified" && (
                    <Badge variant="outline" className="text-xs text-warning border-warning/30">
                      Modified
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {suggestion.description}
                </p>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <div className={`px-2 py-1 rounded border text-xs font-medium ${getConfidenceBg(suggestion.confidence)}`}>
                  <span className={getConfidenceColor(suggestion.confidence)}>
                    {suggestion.confidence}%
                  </span>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-7">
                    {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>

            <CollapsibleContent>
              <div className="mt-3 pt-3 border-t border-border space-y-3">
                {/* Source Phrase */}
                <div className="flex items-start gap-2 p-2 rounded bg-secondary/50">
                  <Quote className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs text-muted-foreground">Source Phrase:</span>
                    <p className="text-sm text-foreground italic">&quot;{suggestion.sourcePhrase}&quot;</p>
                  </div>
                </div>

                {/* Confidence Details */}
                {suggestion.confidence < 80 && (
                  <div className="flex items-start gap-2 p-2 rounded bg-warning/10 border border-warning/20">
                    <AlertCircle className="size-3.5 text-warning mt-0.5 shrink-0" />
                    <p className="text-xs text-warning">
                      Lower confidence score. Please verify this code matches the clinical documentation.
                    </p>
                  </div>
                )}

                {/* Actions */}
                {suggestion.status === "pending" && (
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 gap-1.5 bg-success hover:bg-success/90"
                      onClick={() => handleConfirm(suggestion)}
                    >
                      <Check className="size-3.5" />
                      Confirm
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="gap-1.5"
                      onClick={() => handleStartEdit(suggestion)}
                    >
                      <Edit3 className="size-3.5" />
                      Modify
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="gap-1.5 text-destructive hover:bg-destructive/10"
                      onClick={() => handleReject(suggestion)}
                    >
                      <X className="size-3.5" />
                      Reject
                    </Button>
                  </div>
                )}

                {isEditing && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => handleSaveEdit(suggestion)}>
                      Save Changes
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </CardContent>
        </Card>
      </Collapsible>
    )
  }

  return (
    <Card className="flex-1 flex flex-col overflow-hidden bg-card border-border">
      <CardHeader className="border-b border-border py-3 px-4 shrink-0">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          AI Code Suggestions
          <Badge variant="secondary" className="ml-auto text-xs">
            {pendingSuggestions.length} to review
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-3">
            {/* Pending Suggestions */}
            {pendingSuggestions.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Pending Review
                </h4>
                {pendingSuggestions.map(renderSuggestionCard)}
              </div>
            )}

            {/* Processed Suggestions */}
            {processedSuggestions.length > 0 && (
              <div className="space-y-3 mt-6">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Processed
                </h4>
                {processedSuggestions.map(renderSuggestionCard)}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
