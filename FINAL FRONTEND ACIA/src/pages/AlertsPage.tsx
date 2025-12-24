import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { api } from "@/services/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type AlertItem = {
  type: "Opportunity" | "Risk" | "Watch"
  severity: "Low" | "Medium" | "High"
  title: string
  description: string
  recommended_action: string
  time_horizon: "Immediate" | "Short-term" | "Mid-term" | "Long-term"
  confidence: number
}

export default function AlertsPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState<{ alerts: AlertItem[]; summary: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!jobId) {
      setError("Missing jobId")
      setLoading(false)
      return
    }
    const run = async () => {
      try {
        const res = await api.getAnalysisAlerts(jobId)
        setData(res)
      } catch (e) {
        setError("Failed to fetch alerts")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [jobId])

  const severityOrder = { High: 3, Medium: 2, Low: 1 }
  const colorMap: Record<string, string> = {
    High: "bg-red-100 text-red-900 border-red-200",
    Medium: "bg-orange-100 text-orange-900 border-orange-200",
    Low: "bg-yellow-100 text-yellow-900 border-yellow-200"
  }
  const typeColor: Record<string, string> = {
    Opportunity: "bg-green-100 text-green-900",
    Risk: "bg-red-100 text-red-900",
    Watch: "bg-blue-100 text-blue-900"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div style={{ color: '#CC91FD', fontSize: '24px', fontFamily: "'Inter', sans-serif" }}>
          Loading alerts…
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-700 text-lg">{error}</div>
      </div>
    )
  }

  const alerts = (data?.alerts || []).slice().sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity])

  return (
    <div className="min-h-screen p-8 flex flex-col items-center" style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}>
      <div className="w-full max-w-6xl mb-8">
        <h1
          className="text-5xl font-bold mb-2"
          style={{
            background: 'linear-gradient(135deg, #CC91FD 0%, #9b59d0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 6px rgba(0,0,0,0.12)',
          }}
        >
          Alerts & Key Insights
        </h1>
        <p className="text-black/70 text-lg">{data?.summary}</p>
      </div>

      <div
        className="w-full max-w-6xl"
        style={{
          background: 'rgba(204, 145, 253, 0.85)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 8px 32px 0 rgba(204, 145, 253, 0.3)',
          border: '1px solid rgba(204, 145, 253, 0.4)',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {alerts.map((alert, idx) => (
            <Card key={idx} className={`p-6 border ${colorMap[alert.severity]}`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`px-2 py-1 rounded text-xs font-semibold ${typeColor[alert.type]}`}>
                  {alert.type}
                </div>
                <div className="text-sm font-semibold">{alert.severity}</div>
              </div>
              <div className="text-xl font-bold mb-2">{alert.title}</div>
              <div className="text-black/80 mb-4">{alert.description}</div>
              <div className="bg-black/5 rounded p-3 mb-4">
                <div className="text-xs uppercase font-bold text-black/60 mb-1">Recommended Action</div>
                <div className="text-black font-medium">{alert.recommended_action}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-black/70">{alert.time_horizon}</div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-black/60">Confidence</div>
                  <div className="w-24 h-2 bg-black/10 rounded overflow-hidden">
                    <div className="h-full bg-indigo-600" style={{ width: `${Math.round(alert.confidence * 100)}%` }} />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex gap-4">
          <Button onClick={() => navigate(`/overview`)}>← Overview</Button>
          <Button variant="outline" onClick={() => navigate(`/market-signals`)}>Market Signals →</Button>
        </div>
      </div>
    </div>
  )
}

