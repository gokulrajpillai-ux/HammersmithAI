"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

const collectionData = [
  { month: "Jan", collected: 185000, target: 200000 },
  { month: "Feb", collected: 205000, target: 200000 },
  { month: "Mar", collected: 195000, target: 210000 },
  { month: "Apr", collected: 225000, target: 220000 },
  { month: "May", collected: 240000, target: 230000 },
  { month: "Jun", collected: 255000, target: 240000 },
]

const denialData = [
  { name: "Missing Info", value: 35, color: "var(--chart-1)" },
  { name: "Eligibility", value: 28, color: "var(--chart-2)" },
  { name: "Coding Error", value: 22, color: "var(--chart-3)" },
  { name: "Auth Required", value: 15, color: "var(--chart-4)" },
]

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
        <p className="mb-2 font-medium text-card-foreground">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.dataKey === "collected" ? "Collected" : "Target"}: ${(entry.value / 1000).toFixed(0)}K
          </p>
        ))}
      </div>
    )
  }
  return null
}

function PieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number } }> }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
        <p className="font-medium text-card-foreground">{data.name}</p>
        <p className="text-sm text-muted-foreground">{data.value}% of denials</p>
      </div>
    )
  }
  return null
}

export function CollectionTrendsChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">Collection Trends</CardTitle>
        <CardDescription>Monthly collections vs target over 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={collectionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="month"
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value / 1000}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="collected"
                stroke="var(--chart-1)"
                strokeWidth={3}
                dot={{ fill: "var(--chart-1)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "var(--chart-1)" }}
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="var(--chart-2)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full" style={{ backgroundColor: "var(--chart-1)" }} />
            <span className="text-sm text-muted-foreground">Collected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full border-2 border-dashed" style={{ borderColor: "var(--chart-2)" }} />
            <span className="text-sm text-muted-foreground">Target</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function DenialCategoriesChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">Denial Categories</CardTitle>
        <CardDescription>Breakdown of denial reasons this quarter</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={denialData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {denialData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
