import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { api } from "@/services/api"
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts"

interface AnalysisData {
    jobId: string
    domain: string
    competitor: string
    timestamp: string
}

export default function MarketSignalsPage() {
    const navigate = useNavigate()
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
    const [signalsData, setSignalsData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const stored = localStorage.getItem('latest_analysis_input')
        if (!stored) {
            navigate('/analysis')
            return
        }

        const data = JSON.parse(stored) as AnalysisData
        setAnalysisData(data)

        if (!data.jobId) return;

        const fetchData = async () => {
            try {
                const signals = await api.getAnalysisSignals(data.jobId);
                setSignalsData({
                    available: true,
                    ...signals
                });
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch market signals:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div style={{ color: '#CC91FD', fontSize: '24px', fontFamily: "'Inter', sans-serif" }}>
                    Loading...
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-8 flex flex-col items-center" style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}>
            {/* Back Button */}
            <div className="fixed top-8 left-8 z-30">
                <button
                    onClick={() => navigate('/offerings')}
                    style={{
                        background: 'rgba(0, 0, 0, 0.9)',
                        color: 'white',
                        padding: '14px 24px',
                        borderRadius: '12px',
                        fontSize: '18px',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 1)'
                        e.currentTarget.style.transform = 'scale(1.05)'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)'
                        e.currentTarget.style.transform = 'scale(1)'
                    }}
                >
                    ← Back
                </button>
            </div>

            {/* Header */}
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
                    Market Signals & Scale
                </h1>
                <p style={{ color: 'rgba(0, 0, 0, 0.7)', fontSize: '18px', textShadow: '0 0 6px rgba(0,0,0,0.12)' }}>
                    Domain: <strong>{analysisData?.domain}</strong>
                    {analysisData?.competitor && <> | Competitor: <strong>{analysisData.competitor}</strong></>}
                </p>
            </div>

            {/* Main Content */}
            <div
                className="w-full max-w-6xl"
                style={{
                    background: 'rgba(204, 145, 253, 0.85)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '48px',
                    boxShadow: '0 8px 32px 0 rgba(204, 145, 253, 0.3)',
                    border: '1px solid rgba(204, 145, 253, 0.4)',
                }}
            >
                <div style={{ color: 'rgba(0, 0, 0, 0.9)' }}>
                    <h2 className="text-3xl font-bold mb-6" style={{ textShadow: '0 0 5px rgba(0,0,0,0.12)' }}>Market Presence Analysis</h2>

                    {!signalsData?.available ? (
                        <div className="space-y-6">
                            <p className="text-white">Loading market signals...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Revenue / Financials */}
                            {signalsData.financials ? (
                                <div className="bg-white/95 p-6 rounded-xl shadow-sm">
                                    <h3 className="text-2xl font-bold mb-4 text-green-900 border-b pb-2" style={{ textShadow: '0 0 5px rgba(0,0,0,0.12)' }}>Financial Performance</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-4 bg-green-50 rounded-lg">
                                            <p className="text-sm text-green-800 font-bold uppercase tracking-wider">Revenue</p>
                                            <p className="text-3xl font-bold text-green-900 mt-1">{signalsData.financials.revenue}</p>
                                            <p className="text-sm text-green-700 mt-2">
                                                Growth: <span className="font-bold">{signalsData.financials.growth_rate}</span>
                                            </p>
                                        </div>
                                        <div className="p-4 bg-green-50 rounded-lg">
                                            <p className="text-sm text-green-800 font-bold uppercase tracking-wider">Turnover</p>
                                            <p className="text-3xl font-bold text-green-900 mt-1">{signalsData.financials.turnover}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <p className="text-gray-700 italic">"{signalsData.financials.analysis_summary}"</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white/80 p-6 rounded-xl">
                                    <p>No financial data available.</p>
                                </div>
                            )}

                            {/* Competitor Trend */}
                            {signalsData.competitor_trend ? (
                                <div className="bg-white/95 p-6 rounded-xl shadow-sm">
                                    <h3 className="text-2xl font-bold mb-4 text-blue-900 border-b pb-2" style={{ textShadow: '0 0 5px rgba(0,0,0,0.12)' }}>
                                        {signalsData.competitor_trend.competitor_name} – {signalsData.competitor_trend.metric} history
                                    </h3>
                                    <div style={{ width: '100%', height: 320 }}>
                                        <ResponsiveContainer>
                                            <LineChart data={signalsData.competitor_trend.history}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="period" />
                                                <YAxis />
                                                <Tooltip />
                                                <Line type="monotone" dataKey="value" stroke="#1E3A8A" strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <p className="text-sm mt-3" style={{ color: 'rgba(0,0,0,0.6)' }}>
                                        {signalsData.competitor_trend.analysis_note}
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-white/80 p-6 rounded-xl">
                                    <p>Competitor trend unavailable</p>
                                </div>
                            )}

                            {/* Graph Data: Revenue History */}
                            {signalsData.graph_data?.revenue_history ? (
                                <div className="bg-white/95 p-6 rounded-xl shadow-sm">
                                    <h3 className="text-2xl font-bold mb-4 text-purple-900 border-b pb-2" style={{ textShadow: '0 0 5px rgba(0,0,0,0.12)' }}>
                                        Revenue History (Estimated)
                                    </h3>
                                    <div style={{ width: '100%', height: 300 }}>
                                        <ResponsiveContainer>
                                            <LineChart data={signalsData.graph_data.revenue_history}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="year" />
                                                <YAxis />
                                                <Tooltip />
                                                <Line type="monotone" dataKey="estimated_value" stroke="#7C3AED" strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <p className="text-sm mt-3" style={{ color: 'rgba(0,0,0,0.6)' }}>
                                        Values are conservative estimates with confidence per year.
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-white/80 p-6 rounded-xl">
                                    <p>Revenue history not available</p>
                                </div>
                            )}

                            {/* Graph Data: Growth Rate History */}
                            {signalsData.graph_data?.growth_rate_history ? (
                                <div className="bg-white/95 p-6 rounded-xl shadow-sm">
                                    <h3 className="text-2xl font-bold mb-4 text-indigo-900 border-b pb-2" style={{ textShadow: '0 0 5px rgba(0,0,0,0.12)' }}>
                                        Growth Rate History (Estimated %)
                                    </h3>
                                    <div style={{ width: '100%', height: 300 }}>
                                        <ResponsiveContainer>
                                            <LineChart data={signalsData.graph_data.growth_rate_history}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="year" />
                                                <YAxis />
                                                <Tooltip />
                                                <Line type="monotone" dataKey="estimated_percentage" stroke="#1D4ED8" strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <p className="text-sm mt-3" style={{ color: 'rgba(0,0,0,0.6)' }}>
                                        Trends reflect direction (increase/stable/decline) without unrealistic jumps.
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-white/80 p-6 rounded-xl">
                                    <p>Growth rate history not available</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="mt-8 flex gap-4">
                    <button
                        onClick={() => navigate('/offerings')}
                        style={{
                            background: 'rgba(0, 0, 0, 0.8)',
                            color: 'white',
                            padding: '12px 32px',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        ← Offerings
                    </button>
                    <button
                        onClick={() => navigate('/sentiment')}
                        style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            color: 'black',
                            padding: '12px 32px',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: 600,
                            border: '1px solid rgba(0, 0, 0, 0.2)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        Sentiment & Risks →
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 w-full z-20" style={{
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(10px)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '16px 0'
            }}>
                <div className="flex items-center justify-center gap-8">
                    <button className="text-white/80 hover:text-white transition-colors text-sm font-medium">Help</button>
                    <button className="text-white/80 hover:text-white transition-colors text-sm font-medium">About</button>
                    <button className="text-white/80 hover:text-white transition-colors text-sm font-medium">Contact</button>
                    <button className="text-white/80 hover:text-white transition-colors text-sm font-medium">Privacy</button>
                </div>
            </div>
        </div>
    )
}
