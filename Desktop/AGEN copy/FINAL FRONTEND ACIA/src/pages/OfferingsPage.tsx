import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { api } from "@/services/api"

interface AnalysisData {
    jobId: string
    domain: string
    competitor: string
    timestamp: string
}

export default function OfferingsPage() {
    const navigate = useNavigate()
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
    const [offeringsData, setOfferingsData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const stored = localStorage.getItem('latest_analysis_input')
        if (!stored) {
            navigate('/analysis')
            return
        }

        const data = JSON.parse(stored) as AnalysisData
        setAnalysisData(data)

        if (!data.jobId) return; // Wait or handle legacy

        const fetchData = async () => {
            try {
                const offerings = await api.getAnalysisOfferings(data.jobId);
                setOfferingsData({
                    available: true,
                    ...offerings
                });
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch offerings:", error);

                // Fallback for demo if api fails or job not ready
                // In production, we might want to poll here too or rely on OverviewPage having verified completion
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
                    onClick={() => navigate('/overview')}
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
                    Offerings & Value
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
                    background: 'rgba(204, 145, 253, 0.85)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '48px',
                    boxShadow: '0 8px 32px 0 rgba(204, 145, 253, 0.3)',
                    border: '1px solid rgba(204, 145, 253, 0.4)',
                }}
            >
                <div style={{ color: 'rgba(0, 0, 0, 0.9)' }}>
                    <h2 className="text-3xl font-bold mb-6" style={{ textShadow: '0 0 5px rgba(0,0,0,0.12)' }}>
                        Value Proposition
                    </h2>

                    {!offeringsData?.available ? (
                        <div className="space-y-6">
                            <p className="text-white">Loading data from backend...</p>
                        </div>
                    ) : (
                        // Backend data will render here
                        <div className="space-y-6">
                            {/* Combined Product Launch + Pricing Data */}

                            {/* Product Launches */}
                            {offeringsData.product_launches && offeringsData.product_launches.length > 0 && (
                                <div className="bg-white/95 p-6 rounded-xl shadow-sm">
                                    <h3 className="text-2xl font-bold mb-4 text-purple-900 border-b pb-2" style={{ textShadow: '0 0 5px rgba(0,0,0,0.12)' }}>Recent Launches</h3>
                                    <div className="space-y-4">
                                        {offeringsData.product_launches.map((launch: any, idx: number) => (
                                            <div key={idx} className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-xl text-purple-800" style={{ textShadow: '0 0 4px rgba(0,0,0,0.08)' }}>{launch.product_name}</h4>
                                                    <span className="text-xs font-semibold bg-purple-200 text-purple-800 px-2 py-1 rounded">
                                                        {launch.launch_date}
                                                    </span>
                                                </div>
                                                <p className="text-sm mt-2 text-gray-700">{launch.description}</p>
                                                <div className="mt-3 flex gap-2 flex-wrap">
                                                    {launch.key_features?.map((feat: string, f_idx: number) => (
                                                        <span key={f_idx} className="text-xs bg-white text-gray-600 px-2 py-1 border rounded-full">
                                                            {feat}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Pricing Changes */}
                            {offeringsData.pricing_changes && offeringsData.pricing_changes.length > 0 && (
                                <div className="bg-white/95 p-6 rounded-xl shadow-sm">
                                    <h3 className="text-2xl font-bold mb-4 text-blue-900 border-b pb-2" style={{ textShadow: '0 0 5px rgba(0,0,0,0.12)' }}>Pricing Updates</h3>
                                    <div className="space-y-4">
                                        {offeringsData.pricing_changes.map((change: any, idx: number) => (
                                            <div key={idx} className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                                <div className="flex justify-between">
                                                    <h4 className="font-bold text-blue-800">{change.product_name}</h4>
                                                    <span className={`font-bold ${change.direction === 'increase' ? 'text-red-600' : 'text-green-600'}`}>
                                                        {change.new_price}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">Previous: {change.old_price}</p>
                                                <p className="text-sm mt-2 text-gray-700 italic">"{change.description}"</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(!offeringsData.product_launches?.length && !offeringsData.pricing_changes?.length) && (
                                <div className="bg-white/80 p-6 rounded-xl text-center">
                                    <p>No recent product launches or pricing changes detected.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="mt-8 flex gap-4">
                    <button
                        onClick={() => navigate('/overview')}
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
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)'
                        }}
                    >
                        ← Overview
                    </button>
                    <button
                        onClick={() => navigate('/market-signals')}
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
                        Market Signals →
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
                    <button className="text-white/80 hover:text-white transition-colors text-sm font-medium">Help</button>
                    <button className="text-white/80 hover:text-white transition-colors text-sm font-medium">About</button>
                    <button className="text-white/80 hover:text-white transition-colors text-sm font-medium">Contact</button>
                    <button className="text-white/80 hover:text-white transition-colors text-sm font-medium">Privacy</button>
                </div>
            </div>
        </div>
    )
}
