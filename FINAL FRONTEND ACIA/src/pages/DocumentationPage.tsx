import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "@/services/api"

interface AnalysisData {
    domain: string
    competitor: string
    timestamp: string
    jobId?: string
}

export default function DocumentationPage() {
    const navigate = useNavigate()
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)

    useEffect(() => {
        const stored = localStorage.getItem('latest_analysis_input')
        if (!stored) {
            navigate('/analysis')
            return
        }

        const data = JSON.parse(stored) as AnalysisData
        setAnalysisData(data)
        setLoading(false)
    }, [navigate])

    const handleGenerateDocument = async () => {
        setGenerating(true)

        try {
            const jobId = (analysisData as any)?.jobId
            if (!jobId) {
                alert("No analysis job available. Start a new analysis first.")
                setGenerating(false)
                return
            }
            const response = await fetch(`${api.API_BASE_URL}/api/analysis/${jobId}/export/pdf`, { method: 'POST' })
            if (!response.ok) {
                let errMsg = "Failed to generate document"
                try {
                    const err = await response.json()
                    if (err?.error === "Analysis not complete") {
                        errMsg = "Analysis still running"
                    }
                } catch {}
                alert(errMsg)
                return
            }
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            window.open(url)
        } catch (e) {
            alert("Backend unavailable")
        } finally {
            setGenerating(false)
        }
    }

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
                    onClick={() => navigate('/sentiment')}
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
                    Documentation
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
                    <h2 className="text-3xl font-bold mb-6" style={{ textShadow: '0 0 5px rgba(0,0,0,0.12)' }}>Analysis Summary Report</h2>

                    <div className="space-y-6">
                        {/* Report Info */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            padding: '24px',
                            borderRadius: '12px',
                            border: '1px solid rgba(0, 0, 0, 0.1)'
                        }}>
                            <h3 className="text-lg font-bold mb-3">Report Contents</h3>
                            <p style={{ fontSize: '16px', lineHeight: '1.6', color: 'rgba(0, 0, 0, 0.7)', marginBottom: '16px' }}>
                                This document will compile insights from all analysis tabs into a professional summary report.
                            </p>
                            <ul style={{ marginLeft: '20px', color: 'rgba(0, 0, 0, 0.7)', fontSize: '15px', lineHeight: '2' }}>
                                <li>• <strong>Overview</strong> - Entity description and market positioning</li>
                                <li>• <strong>Offerings & Value</strong> - Products, services, and value proposition</li>
                                <li>• <strong>Market Signals</strong> - Growth indicators and scale analysis</li>
                                <li>• <strong>Sentiment & Strategy</strong> - Risks, opportunities, and public perception</li>
                            </ul>
                        </div>

                        {/* Data Availability Notice */}
                        <div style={{
                            background: 'rgba(155, 89, 208, 0.2)',
                            padding: '20px',
                            borderRadius: '8px',
                            border: '1px solid rgba(155, 89, 208, 0.3)'
                        }}>
                            <p style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.8)', lineHeight: '1.6' }}>
                                <strong>Backend Integration Required:</strong> Document generation uses real data from backend analysis.
                                In demo mode, no document is generated. Connect to API for full PDF export functionality.
                            </p>
                        </div>

                        {/* Generate Button */}
                        <div className="flex flex-col items-center gap-4 mt-8">
                            <button
                                onClick={handleGenerateDocument}
                                disabled={generating}
                                style={{
                                    background: generating
                                        ? 'rgba(100, 100, 100, 0.5)'
                                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    padding: '16px 48px',
                                    borderRadius: '12px',
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    border: 'none',
                                    cursor: generating ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: generating ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)',
                                }}
                                onMouseEnter={(e) => {
                                    if (!generating) {
                                        e.currentTarget.style.transform = 'translateY(-2px)'
                                        e.currentTarget.style.boxShadow = '0 6px 25px rgba(102, 126, 234, 0.6)'
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!generating) {
                                        e.currentTarget.style.transform = 'translateY(0)'
                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)'
                                    }
                                }}
                            >
                                {generating ? 'Generating...' : '📄 Generate & Download Summary'}
                            </button>
                            <p style={{ fontSize: '13px', color: 'rgba(0, 0, 0, 0.6)' }}>
                                Professional PDF report with all analysis insights
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="mt-8 flex gap-4">
                    <button
                        onClick={() => navigate('/sentiment')}
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
                        ← Sentiment
                    </button>
                    <button
                        onClick={() => navigate('/overview')}
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
                        Back to Overview
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
