export const getSentimentColor = (sentiment: "positive" | "neutral" | "negative"): string => {
  const colors = {
    positive: "#10b981", // green
    neutral: "#f59e0b", // amber
    negative: "#ef4444", // red
  }
  return colors[sentiment] || "#6b7280"
}

export const getHealthScoreColor = (score: number): string => {
  if (score >= 80) return "#10b981" // green
  if (score >= 60) return "#f59e0b" // amber
  if (score >= 40) return "#f97316" // orange
  return "#ef4444" // red
}

export const getSeverityColor = (severity: "high" | "medium" | "low"): string => {
  const colors = {
    high: "#ef4444", // red
    medium: "#f59e0b", // amber
    low: "#3b82f6", // blue
  }
  return colors[severity] || "#6b7280"
}

export const getTrendIndicatorColor = (trend: "up" | "down"): string => {
  return trend === "up" ? "#10b981" : "#ef4444"
}
