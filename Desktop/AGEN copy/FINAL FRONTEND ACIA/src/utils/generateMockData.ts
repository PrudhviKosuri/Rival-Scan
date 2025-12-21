import type { Competitor, Alert, Insight } from "@/types"

export const generateCompetitorsMock = (count = 5): Competitor[] => {
  const categories = ["Electronics", "Retail", "Software", "Mobile", "Sustainability"]
  const competitors: Competitor[] = []

  for (let i = 0; i < count; i++) {
    competitors.push({
      id: i + 1,
      name: `Competitor ${i + 1}`,
      category: categories[i % categories.length],
      logo: `C${i + 1}`,
      mentions: Math.floor(Math.random() * 2000),
      sentiment: ["positive", "neutral", "negative"][Math.floor(Math.random() * 3)] as any,
      alerts: Math.floor(Math.random() * 100),
      description: `A leading company in ${categories[i % categories.length].toLowerCase()}`,
      kpis: {
        mentions: Math.floor(Math.random() * 2000),
        sentimentScore: Math.random() * 10,
        alerts: Math.floor(Math.random() * 100),
      },
      chartData: Array.from({ length: 6 }, (_, i) => ({
        month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i],
        mentions: Math.floor(Math.random() * 1000),
      })),
      recentAlerts: [
        {
          id: 1,
          type: "Product Launch",
          description: "New product announced",
          time: "2 hours ago",
        },
      ],
      trend: Array.from({ length: 6 }, () => ({ value: Math.floor(Math.random() * 200) })),
    })
  }

  return competitors
}

export const generateAlertsMock = (count = 8): Alert[] => {
  const severities: Array<"high" | "medium" | "low"> = ["high", "medium", "low"]
  const categories = ["Competitor", "Market", "Product", "Social", "Sentiment", "Other"]
  const alerts: Alert[] = []

  for (let i = 0; i < count; i++) {
    alerts.push({
      id: i + 1,
      title: `Alert ${i + 1}`,
      category: categories[i % categories.length] as any,
      description: `This is a sample alert description for demonstration purposes`,
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      severity: severities[Math.floor(Math.random() * 3)],
    })
  }

  return alerts
}

export const generateInsightsMock = (count = 4): Insight[] => {
  const insights: Insight[] = []

  for (let i = 0; i < count; i++) {
    insights.push({
      id: i + 1,
      title: `Insight ${i + 1}`,
      description: `AI-generated insight about market trends`,
      category: "Market",
      value: `${Math.floor(Math.random() * 100)}%`,
      trend: Array.from({ length: 6 }, () => ({ value: Math.floor(Math.random() * 100) })),
    })
  }

  return insights
}
