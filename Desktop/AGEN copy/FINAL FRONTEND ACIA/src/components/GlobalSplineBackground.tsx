export default function GlobalSplineBackground() {
    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -1,
                pointerEvents: 'none'
            }}
        >
            <spline-viewer
                url="https://prod.spline.design/kgXTa79hhIVoST6g/scene.splinecode"
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    )
}
