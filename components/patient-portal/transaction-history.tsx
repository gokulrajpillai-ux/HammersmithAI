"use client"

import { Receipt, ArrowDownLeft, ArrowUpRight, Minus, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import type { Transaction } from "@/app/patient-portal/page"

interface TransactionHistoryProps {
  transactions: Transaction[]
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const formatCurrency = (amount: number) => {
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount))
    return amount < 0 ? `-${formatted}` : formatted
  }

  const getTypeIcon = (type: "payment" | "charge" | "adjustment") => {
    switch (type) {
      case "payment":
        return <ArrowDownLeft className="size-4 text-success" />
      case "charge":
        return <ArrowUpRight className="size-4 text-warning" />
      case "adjustment":
        return <Minus className="size-4 text-primary" />
    }
  }

  const getTypeBadge = (type: "payment" | "charge" | "adjustment") => {
    switch (type) {
      case "payment":
        return <Badge className="bg-success/10 text-success border-success/30 hover:bg-success/20">Payment</Badge>
      case "charge":
        return <Badge className="bg-warning/10 text-warning border-warning/30 hover:bg-warning/20">Charge</Badge>
      case "adjustment":
        return <Badge className="bg-primary/10 text-primary border-primary/30 hover:bg-primary/20">Adjustment</Badge>
    }
  }

  const getAmountColor = (type: "payment" | "charge" | "adjustment", amount: number) => {
    if (type === "payment" || amount < 0) return "text-success"
    if (type === "charge") return "text-foreground"
    return "text-primary"
  }

  const handleDownloadStatement = () => {
    toast.success("Statement Downloaded", {
      description: "Your account statement has been downloaded.",
    })
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Receipt className="size-5 text-primary" />
            Transaction History
          </CardTitle>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleDownloadStatement}>
            <Download className="size-4" />
            Download Statement
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Service Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((txn) => (
              <TableRow key={txn.id} className="group">
                <TableCell className="font-medium">{txn.date}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(txn.type)}
                    <span>{txn.description}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{txn.serviceDate}</TableCell>
                <TableCell>{getTypeBadge(txn.type)}</TableCell>
                <TableCell className={`text-right font-semibold ${getAmountColor(txn.type, txn.amount)}`}>
                  {txn.type === "payment" ? "-" : ""}{formatCurrency(txn.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
