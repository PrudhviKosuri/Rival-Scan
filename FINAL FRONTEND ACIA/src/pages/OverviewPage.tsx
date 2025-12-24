import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { api } from "@/services/api"

interface AnalysisData {
    jobId: string
    domain: string
    competitor: string
    timestamp: string
}

export default function OverviewPage() {
    const navigate = useNavigate()
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
    const [overviewData, setOverviewData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const stored = localStorage.getItem('latest_analysis_input')
        if (!stored) {
            navigate('/analysis')
            return
        }

        const data = JSON.parse(stored) as AnalysisData
        if (!data.jobId) {
            // Legacy data without Job ID
            alert("Please start a new analysis to use the backend.");
            navigate('/analysis')
            return;
        }

        setAnalysisData(data)

        let pollInterval: NodeJS.Timeout;

        const checkStatus = async () => {
            try {
                const statusData = await api.getJobStatus(data.jobId);
                console.log("Job Status:", statusData.status);

                if (statusData.status === 'completed') {
                    clearInterval(pollInterval);
                    // Fetch real overview data
                    const overview = await api.getAnalysisOverview(data.jobId);
                    setOverviewData({
                        available: true,
                        ...overview
                    });
                    setLoading(false);
                } else if (statusData.status === 'failed') {
                    clearInterval(pollInterval);
                    setLoading(false);
                    alert("Analysis job failed on backend.");
                }
            } catch (e) {
                console.error("Polling error:", e);
            }
        };

        // Initial check
        checkStatus();

        // Poll every 3 seconds
        pollInterval = setInterval(checkStatus, 3000);

        return () => clearInterval(pollInterval);
    }, [navigate])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ position: 'relative' }}>
                <div style={{ color: '#CC91FD', fontSize: '24px', fontFamily: "'Inter', sans-serif" }}>
                    Loading analysis...
                </div>
                <div
                    className="fixed bottom-0 left-0 w-full z-20"
                    style={{
                        background: 'rgba(0, 0, 0, 0.92)',
                        backdropFilter: 'blur(12px)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                        padding: '16px 0'
                    }}
                >
                    <div className="flex items-center justify-center gap-8">
                        <button className="text-white/80 hover:text-white transition-colors text-sm font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Help
                        </button>
                        <button className="text-white/80 hover:text-white transition-colors text-sm font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                            About
                        </button>
                        <button className="text-white/80 hover:text-white transition-colors text-sm font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Contact
                        </button>
                        <button className="text-white/80 hover:text-white transition-colors text-sm font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Privacy
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-8 flex flex-col items-center" style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}>
            {/* Back Button */}
            <div className="fixed top-8 left-8 z-30">
                <button
                    onClick={() => navigate('/analysis')}
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
            <div className="w-full max-w-7xl mb-8">
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
                    Overview
                </h1>
                <p style={{ color: 'rgba(0, 0, 0, 0.7)', fontSize: '18px', textShadow: '0 0 6px rgba(0,0,0,0.12)' }}>
                    Domain: <strong>{analysisData?.domain}</strong>
                    {analysisData?.competitor && <> | Competitor: <strong>{analysisData.competitor}</strong></>}
                </p>
            </div>

            {/* Main Content Container */}
            <div
                className="w-full max-w-6xl"
                style={{
                    background: '#CC91FD',
                    borderRadius: '24px',
                    padding: '48px',
                    boxShadow: '0 8px 32px 0 rgba(204, 145, 253, 0.3)',
                }}
            >
                {/* Content */}
                <div style={{ color: 'rgba(0, 0, 0, 0.9)' }}>
                    <h2 className="text-3xl font-bold mb-6" style={{ textShadow: '0 0 5px rgba(0,0,0,0.12)' }}>
                        Analysis Overview
                    </h2>

                    {!overviewData?.available ? (
                        // Fallback / Loading text if needed, though 'loading' state handles mostly
                        <div className="space-y-4">
                            <p>Waiting for data...</p>
                        </div>
                    ) : (
                        // Real Backend Data
                        <div className="space-y-6">
                            <div className="bg-white/90 p-6 rounded-xl border border-black/10">
                                <h3 className="text-2xl font-bold mb-2 text-primary" style={{ textShadow: '0 0 5px rgba(0,0,0,0.12)' }}>Company Profile</h3>
                                <p className="text-xl text-black/80" style={{ textShadow: '0 0 4px rgba(0,0,0,0.08)' }}>{overviewData.company_name} ({overviewData.industry})</p>
                                <p className="text-md text-black/60">{overviewData.headquarters}</p>
                                <p className="mt-4 text-black/90 leading-relaxed">{overviewData.market_position}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white/80 p-5 rounded-xl">
                                    <h4 className="text-xl font-bold mb-3 text-purple-700" style={{ textShadow: '0 0 4px rgba(0,0,0,0.08)' }}>Key Products</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-black/80">
                                        {overviewData.key_products?.map((prod: string, i: number) => (
                                            <li key={i}>{prod}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-white/80 p-5 rounded-xl">
                                    <h4 className="text-xl font-bold mb-3 text-purple-700" style={{ textShadow: '0 0 4px rgba(0,0,0,0.08)' }}>Strategic Focus</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-black/80">
                                        {overviewData.strategic_focus_areas?.map((focus: string, i: number) => (
                                            <li key={i}>{focus}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex gap-4">
                    <button
                        onClick={() => navigate('/analysis')}
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
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 1)'
                            e.currentTarget.style.transform = 'translateY(-2px)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)'
                            e.currentTarget.style.transform = 'translateY(0)'
                        }}
                    >
                        ← New Analysis
                    </button>
                    <button
                        onClick={() => navigate('/offerings')}
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
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 1)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'
                        }}
                    >
                        Offerings & Value →
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div
                className="fixed bottom-0 left-0 w-full z-20"
                style={{
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '16px 0'
                }}
            >
                <div className="flex items-center justify-center gap-8">
                    <button
                        className="text-white/80 hover:text-white transition-colors text-sm font-medium"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                        Help
                    </button>
                    <button
                        className="text-white/80 hover:text-white transition-colors text-sm font-medium"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                        About
                    </button>
                    <button
                        className="text-white/80 hover:text-white transition-colors text-sm font-medium"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                        Contact
                    </button>
                    <button
                        className="text-white/80 hover:text-white transition-colors text-sm font-medium"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                        Privacy
                    </button>
                </div>
            </div>
        </div >
    )
}
