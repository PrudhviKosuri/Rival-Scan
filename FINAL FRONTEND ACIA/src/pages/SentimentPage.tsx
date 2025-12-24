import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { api } from "@/services/api"

interface AnalysisData {
    jobId: string
    domain: string
    competitor: string
    timestamp: string
}

export default function SentimentPage() {
    const navigate = useNavigate()
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
    const [sentimentData, setSentimentData] = useState<any>(null)
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
                const sentiment = await api.getAnalysisSentiment(data.jobId);
                setSentimentData({
                    available: true,
                    ...sentiment
                });
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch sentiment:", error);
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
                    onClick={() => navigate('/market-signals')}
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
                    Sentiment, Risks & Opportunities
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
                    <h2 className="text-3xl font-bold mb-6" style={{ textShadow: '0 0 5px rgba(0,0,0,0.12)' }}>Strategic Analysis</h2>

                    {!sentimentData?.available ? (
                        <div className="space-y-6">
                            <p className="text-white">Loading sentiment analysis...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Sentiment Summary */}
                            <div className="bg-white/95 p-6 rounded-xl shadow-sm">
                                <h3 className="text-2xl font-bold mb-4 text-purple-900 border-b pb-2" style={{ textShadow: '0 0 5px rgba(0,0,0,0.12)' }}>Sentiment Overview</h3>
                                <div className="p-4 bg-purple-50 rounded-lg">
                                    <p className="text-lg text-purple-900 leading-relaxed">
                                        "{sentimentData.sentiment_summary}"
                                    </p>
                                </div>
                            </div>

                            {/* Key Risks (Mocked in Backend for now as "General Market Volatility") */}
                            <div className="bg-white/95 p-6 rounded-xl shadow-sm">
                                <h3 className="text-2xl font-bold mb-4 text-red-900 border-b pb-2" style={{ textShadow: '0 0 5px rgba(0,0,0,0.12)' }}>Key Risks</h3>
                                <ul className="list-disc pl-5 space-y-2 text-red-800">
                                    <li>Competitor aggressive pricing strategy</li>
                                    <li>Market saturation in core segments</li>
                                </ul>
                            </div>

                            {/* Opportunities */}
                            <div className="bg-white/95 p-6 rounded-xl shadow-sm">
                                <h3 className="text-2xl font-bold mb-4 text-blue-900 border-b pb-2" style={{ textShadow: '0 0 5px rgba(0,0,0,0.12)' }}>Strategic Opportunities</h3>
                                <ul className="list-disc pl-5 space-y-2 text-blue-800">
                                    <li>Expand into emerging markets</li>
                                    <li>Leverage AI for operational efficiency</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="mt-8 flex gap-4">
                    <button
                        onClick={() => navigate('/market-signals')}
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
                        ← Market Signals
                    </button>
                    <button
                        onClick={() => navigate('/documentation')}
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
                        Documentation →
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
