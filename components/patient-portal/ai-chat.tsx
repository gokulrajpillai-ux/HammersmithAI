"use client"

import { useState } from "react"
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hello! I'm your AI Billing Assistant. I can help you understand your statement, explain charges, or answer questions about payment options. How can I assist you today?",
    timestamp: new Date(),
  },
]

const quickResponses = [
  "Explain my balance",
  "Payment options",
  "Insurance coverage",
  "Download statement",
]

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        "Explain my balance": "Your current balance of ₹48,750 represents your portion after insurance. Your insurance (Star Health) covered ₹2,15,400 of the total charges. This amount includes your recent orthopedic consultation, lab work, and MRI scan from April.",
        "Payment options": "You have 3 payment options:\n\n1. Pay in Full - Get 5% off (₹46,313 total)\n2. 3-Month Plan - ₹16,250/month, 0% interest\n3. 6-Month Plan - ₹8,125/month, flexible terms\n\nWould you like me to help you set up a payment plan?",
        "Insurance coverage": "Your Star Health Insurance plan covered 82% of your total medical expenses (₹2,15,400 out of ₹2,64,150). The remaining ₹48,750 is your patient responsibility, which includes copays and services not covered under your plan.",
        "Download statement": "I can help you download your statement. Click the 'Download Statement' button in the Transaction History section above, or I can email it to your registered email address. Which would you prefer?",
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responses[messageText] || "I understand you're asking about your billing. Let me help you with that. Could you please provide more details about what you'd like to know? I can explain charges, payment options, or insurance coverage.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <>
      {/* Floating Button */}
      <Button
        className={`fixed bottom-6 right-6 size-14 rounded-full shadow-lg z-50 ${
          isOpen ? "hidden" : ""
        }`}
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="size-6" />
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[380px] max-h-[500px] shadow-2xl z-50 flex flex-col border-border">
          <CardHeader className="py-3 px-4 border-b border-border shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="size-4 text-primary" />
                </div>
                AI Billing Assistant
                <Badge variant="secondary" className="text-xs gap-1">
                  <Sparkles className="size-3" />
                  AI
                </Badge>
              </CardTitle>
              <Button variant="ghost" size="icon" className="size-8" onClick={() => setIsOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="size-3 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === "user" && (
                      <div className="size-6 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <User className="size-3 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-2 justify-start">
                    <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="size-3 text-primary" />
                    </div>
                    <div className="bg-secondary rounded-lg px-3 py-2">
                      <div className="flex gap-1">
                        <span className="size-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="size-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="size-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick Responses */}
            <div className="px-4 py-2 border-t border-border">
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-2">
                  {quickResponses.map((response) => (
                    <Button
                      key={response}
                      variant="outline"
                      size="sm"
                      className="text-xs shrink-0"
                      onClick={() => handleSend(response)}
                    >
                      {response}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Input */}
            <div className="p-4 pt-2 border-t border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your statement..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!input.trim()}>
                  <Send className="size-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
