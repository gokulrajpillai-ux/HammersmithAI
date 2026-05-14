import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardHeader } from "@/components/dashboard/header"
import { MetricCards } from "@/components/dashboard/metric-cards"
import { AIDenialPredictor } from "@/components/dashboard/ai-denial-predictor"
import { ClaimsTable } from "@/components/dashboard/claims-table"
import { CollectionTrendsChart, DenialCategoriesChart } from "@/components/dashboard/charts"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <DashboardHeader />
        
        {/* Metric Cards */}
        <MetricCards />
        
        {/* AI Denial Predictor */}
        <AIDenialPredictor />
        
        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <CollectionTrendsChart />
          <DenialCategoriesChart />
        </div>
        
        {/* Claims Table */}
        <ClaimsTable />
      </div>
    </DashboardLayout>
  )
}
