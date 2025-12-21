import { useEffect, useRef } from "react"


interface SplashScreenProps {
    onFinish: () => void
}

export const SplashScreen = ({ onFinish }: SplashScreenProps) => {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        const video = videoRef.current
        if (video) {
            // Ensure video plays
            video.play().catch(err => console.error("Video play failed", err));
        }

        const timer = setTimeout(() => {
            onFinish()
        }, 4000)

        return () => clearTimeout(timer)
    }, [onFinish])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
            <video
                ref={videoRef}
                src="/splash-video.mp4"
                className="h-full w-full object-cover"
                autoPlay
                muted
                playsInline
                onEnded={onFinish}
            />
        </div>
    )
}
