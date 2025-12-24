// Competitor types
export interface Competitor {
  id: number
  name: string
  category: string
  logo: string
  mentions: number
  sentiment: "positive" | "neutral" | "negative"
  alerts: number
  description: string
  kpis: CompetitorKPI
  chartData: ChartDataPoint[]
  recentAlerts: Alert[]
  trend: TrendDataPoint[]
}

export interface CompetitorKPI {
  mentions: number
  sentimentScore: number
  alerts: number
}

// Source types
export interface Source {
  id: number
  name: string
  url: string
  category: SourceCategory
  status: SourceStatus
  lastScraped: string
  nextScheduled: string
  healthScore: number
  scrapFrequency: string
}

export type SourceCategory = "Website" | "RSS" | "API" | "PDF" | "Social Media" | "Email"
export type SourceStatus = "active" | "syncing" | "error"

// Alert types
export interface Alert {
  id: number
  title: string
  category: AlertCategory
  description: string
  timestamp: string
  severity: AlertSeverity
  type?: string
  time?: string
}

export type AlertCategory = "Competitor" | "Market" | "Product" | "Social" | "Sentiment" | "Other"
export type AlertSeverity = "high" | "medium" | "low"

// Insight types
export interface Insight {
  id: number
  title: string
  description: string
  category: string
  trend: TrendDataPoint[]
  value: string | number
}

export interface Report {
  id: number
  title: string
  category: string
  summary: string
  keyTakeaways: string[]
  generatedAt: string
  content: string
}

// Chart data types
export interface ChartDataPoint {
  month?: string
  months?: string
  mentions?: number
  value?: number
  [key: string]: any
}

export interface TrendDataPoint {
  value: number
}

// API Response types
export interface ApiResponse<T> {
  data: T
  status: "success" | "error"
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// Filter types
export interface CompetitorFilter {
  search: string
  category: string
}

export interface AlertFilter {
  severity: AlertSeverity | "all"
  category: AlertCategory | "all"
  search: string
}
