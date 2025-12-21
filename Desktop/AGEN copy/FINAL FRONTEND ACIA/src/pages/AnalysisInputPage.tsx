import { useState, FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/services/api"

export default function AnalysisInputPage() {
    const navigate = useNavigate()
    const [domain, setDomain] = useState("")
    const [competitor, setCompetitor] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (!domain.trim() || !competitor.trim()) {
            return
        }

        setIsSubmitting(true)

        setIsSubmitting(true)

        try {
            // Call Backend API
            console.log("Creating analysis job...");
            const result = await api.createAnalysisJob(domain.trim(), competitor.trim());
            console.log("Job created:", result);

            // Store Job ID and Input Data
            const analysisData = {
                jobId: result.job_id,
                domain: domain.trim(),
                competitor: competitor.trim(),
                timestamp: new Date().toISOString()
            }
            localStorage.setItem('latest_analysis_input', JSON.stringify(analysisData));

            // Navigate to overview to start polling
            navigate('/overview');
        } catch (error) {
            console.error("Failed to start analysis:", error);
            alert("Failed to start analysis. Please check that the backend is running.");
            setIsSubmitting(false);
        }
    }

    const isFormValid = domain.trim().length > 0 && competitor.trim().length > 0

    return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}>
            {/* Glassmorphism Container */}
            <div
                className="w-full max-w-2xl relative z-10"
                style={{
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                    padding: '48px',
                }}
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <h1
                        className="text-6xl font-bold mb-4"
                        style={{
                            background: 'linear-gradient(135deg, #000000ff 0%, #000000ff 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            textShadow: '0 0 6px rgba(255,255,255,0.15)',
                            letterSpacing: '-0.02em'
                        }}
                    >
                        RIVALSCAN
                    </h1>
                    <p
                        className="text-xl"
                        style={{
                            color: 'rgba(0, 0, 0, 0.9)',
                            textShadow: '0 0 6px rgba(0,0,0,0.12)',
                            fontWeight: 300,
                            letterSpacing: '0.02em'
                        }}
                    >
                        Unlock competitive insights powered by advanced AI
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Domain Input */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="domain"
                            style={{
                                color: 'rgba(0, 0, 0, 0.7)',
                                textShadow: '0 0 4px rgba(0,0,0,0.1)',
                                fontSize: '15px',
                                fontWeight: 600,
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase'
                            }}
                        >
                            Domain to Analyze
                        </Label>
                        <Input
                            id="domain"
                            type="text"
                            placeholder="e.g. fintech, edtech, healthcare, ai tools"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            className="h-14 text-xl"
                            style={{
                                background: 'rgba(255, 255, 255, 0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '12px',
                                color: 'black',
                                textShadow: '0 0 3px rgba(0,0,0,0.1)',
                                fontSize: '16px',
                                fontWeight: 600,
                                transition: 'all 0.3s ease',
                            }}
                            onFocus={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.4)'
                                e.target.style.borderColor = 'rgba(102, 126, 234, 0.8)'
                                e.target.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.3)'
                            }}
                            onBlur={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.3)'
                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                                e.target.style.boxShadow = 'none'
                            }}
                        />
                    </div>

                    {/* Competitor Input */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="competitor"
                            style={{
                                color: 'rgba(0, 0, 0, 0.7)',
                                textShadow: '0 0 4px rgba(0,0,0,0.1)',
                                fontSize: '15px',
                                fontWeight: 600,
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase'
                            }}
                        >
                            Competitor to Analyze
                        </Label>
                        <Input
                            id="competitor"
                            type="text"
                            placeholder="e.g. Stripe, Notion, OpenAI"
                            value={competitor}
                            onChange={(e) => setCompetitor(e.target.value)}
                            className="h-14 text-xl"
                            style={{
                                background: 'rgba(255, 255, 255, 0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '12px',
                                color: 'black',
                                textShadow: '0 0 3px rgba(0,0,0,0.1)',
                                fontSize: '16px',
                                fontWeight: 600,
                                transition: 'all 0.3s ease',
                            }}
                            onFocus={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.4)'
                                e.target.style.borderColor = 'rgba(102, 126, 234, 0.8)'
                                e.target.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.3)'
                            }}
                            onBlur={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.3)'
                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                                e.target.style.boxShadow = 'none'
                            }}
                        />
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={!isFormValid || isSubmitting}
                        className="w-full h-14 text-lg font-semibold mt-8"
                        style={{
                            background: isFormValid
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'rgba(100, 100, 100, 0.3)',
                            border: 'none',
                            borderRadius: '12px',
                            color: isFormValid ? 'white' : 'rgba(255, 255, 255, 0.14)',
                            cursor: isFormValid ? 'pointer' : 'not-allowed',
                            transition: 'all 0.3s ease',
                            boxShadow: isFormValid ? '0 4px 15px rgba(102, 126, 234, 0.4)' : 'none',
                            letterSpacing: '0.5px'
                        }}
                        onMouseEnter={(e) => {
                            if (isFormValid) {
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.boxShadow = '0 6px 25px rgba(102, 126, 234, 0.6)'
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (isFormValid) {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)'
                            }
                        }}
                    >
                        {isSubmitting ? 'Processing...' : 'Start Analysis'}
                    </Button>
                </form>

                {/* Footer Note */}
                <div
                    className="mt-8 text-center text-sm"
                    style={{
                        color: 'rgba(67, 67, 67, 0.6)',
                        fontWeight: 300
                    }}
                >
                    Powered by advanced AI algorithms
                </div>
            </div>

            {/* Footer to hide Spline watermark */}
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
        </div>
    )
}
