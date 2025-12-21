export default function TestPage() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            position: 'relative',
            zIndex: 1
        }}>
            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '40px',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(10px)',
                maxWidth: '600px',
                textAlign: 'center'
            }}>
                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    marginBottom: '20px',
                    color: '#1F2937'
                }}>
                    Test Page
                </h1>
                <p style={{
                    fontSize: '1.25rem',
                    color: '#6B7280',
                    marginBottom: '20px'
                }}>
                    This page demonstrates the global Spline background.
                </p>
                <p style={{
                    fontSize: '1rem',
                    color: '#374151',
                    lineHeight: '1.6'
                }}>
                    The animated gradient background should be visible behind this content.
                    It should not interfere with scrolling or clicking on this text.
                </p>
                <div style={{
                    marginTop: '30px',
                    padding: '20px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '8px',
                    border: '2px solid rgba(59, 130, 246, 0.3)'
                }}>
                    <p style={{ color: '#1E40AF', fontWeight: '500' }}>
                        ✓ Background is fixed and fills the viewport<br />
                        ✓ Content is clickable and scrollable<br />
                        ✓ Landing page (/) has no background
                    </p>
                </div>
            </div>
        </div>
    )
}
