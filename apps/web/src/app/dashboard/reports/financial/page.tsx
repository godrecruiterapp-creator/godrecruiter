'use client'

import { BarChart3, Sparkles, TrendingUp, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

const REPORT_CARDS = [
  { name: 'Revenue', desc: 'Total revenue across all placements' },
  { name: 'Gross Margin', desc: 'Margin after pay rate costs' },
  { name: 'Bill Rate', desc: 'Average bill rate by client and role' },
  { name: 'Pay Rate', desc: 'Average pay rate by specialty' },
  { name: 'Spread', desc: 'Difference between bill and pay rates' },
  { name: 'Placements Revenue', desc: 'Revenue per placement detail' },
  { name: 'Revenue by Recruiter', desc: 'Revenue attributed per recruiter' },
  { name: 'Revenue by Client', desc: 'Revenue breakdown by client' },
  { name: 'Revenue Trend', desc: 'Monthly revenue trend chart' },
]

const KPIS = [
  { label: 'Total Revenue', value: '$1.24M' },
  { label: 'Avg Bill Rate', value: '$68/hr' },
  { label: 'Avg Pay Rate', value: '$52/hr' },
  { label: 'Avg Spread', value: '$16/hr' },
  { label: 'Gross Margin', value: '23.5%' },
]

const REVENUE = [
  { period: 'Jan 2026', revenue: '$168K', margin: '22.1%', placements: 12, avgSpread: '$14.80' },
  { period: 'Feb 2026', revenue: '$184K', margin: '23.0%', placements: 13, avgSpread: '$15.60' },
  { period: 'Mar 2026', revenue: '$198K', margin: '23.8%', placements: 14, avgSpread: '$16.20' },
  { period: 'Apr 2026', revenue: '$211K', margin: '24.1%', placements: 15, avgSpread: '$16.50' },
  { period: 'May 2026', revenue: '$224K', margin: '23.9%', placements: 16, avgSpread: '$16.10' },
  { period: 'Jun 2026', revenue: '$255K', margin: '24.4%', placements: 18, avgSpread: '$17.20' },
]

const INSIGHTS = [
  'Revenue grew 12% month-over-month in June — strongest month this year.',
  'Gross margin expanded to 24.4% — driven by higher bill rates in healthcare.',
  'Top 3 clients account for 58% of total revenue — concentration risk worth monitoring.',
  'Spread per placement averaged $16.90 this quarter — up $1.30 from Q1.',
]

export default function FinancialReports() {
  return (
    <div className="flex flex-col h-full p-6 gap-4 overflow-y-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Financial Reports</h1>
          <p className="text-sm text-muted-foreground">Revenue, margin, bill rates, and financial performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-8 text-xs border rounded-md px-2 bg-background"><option>YTD 2026</option><option>Last Quarter</option></select>
          <Button size="sm" variant="outline" className="gap-1.5"><Download className="size-3.5" />Export</Button>
        </div>
      </div>

      {/* KPI Mini-cards */}
      <div className="flex items-center gap-3">
        {KPIS.map((k) => (
          <div key={k.label} className="rounded-lg border bg-card p-3 flex-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{k.label}</p>
            <p className="text-xl font-bold mt-0.5">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {REPORT_CARDS.map((r) => (
          <div key={r.name} className="rounded-lg border bg-card p-4 hover:shadow-md hover:border-brand/30 cursor-pointer transition-all">
            <div className="flex items-start gap-3">
              <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                <BarChart3 className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{r.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                <p className="text-xs text-brand mt-2">View Report →</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm font-semibold mb-3">Revenue Summary</p>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground border-b">
              <th className="pb-2 text-left font-medium">Period</th>
              <th className="pb-2 text-right font-medium">Revenue</th>
              <th className="pb-2 text-right font-medium">Gross Margin</th>
              <th className="pb-2 text-right font-medium">Placements</th>
              <th className="pb-2 text-right font-medium">Avg Spread</th>
            </tr>
          </thead>
          <tbody>
            {REVENUE.map((r) => (
              <tr key={r.period} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-2 font-medium">{r.period}</td>
                <td className="py-2 text-right font-medium text-emerald-600">{r.revenue}</td>
                <td className="py-2 text-right">{r.margin}</td>
                <td className="py-2 text-right">{r.placements}</td>
                <td className="py-2 text-right">{r.avgSpread}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-brand/20 bg-brand-muted/20 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="size-4 text-brand" />
          <span className="text-sm font-semibold">AI Insights</span>
          <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Powered by Claude</span>
        </div>
        <ul className="space-y-2">
          {INSIGHTS.map((insight, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <TrendingUp className="size-3.5 mt-0.5 shrink-0 text-emerald-600" />
              {insight}
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {['Summarize', 'Explain Trends', 'Detect Anomalies', 'Forecast', 'Recommend Actions'].map((a) => (
            <button key={a} className="h-7 px-3 text-xs border border-border rounded-md hover:bg-muted transition-colors">{a}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
