import { useLocation } from "react-router-dom"
import GlobalSplineBackground from "./GlobalSplineBackground"

interface ConditionalLayoutProps {
    children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
    const location = useLocation()

    // Don't show background on the SplineLanding page (/)
    const showBackground = location.pathname !== "/"

    return (
        <>
            {showBackground && <GlobalSplineBackground />}
            {children}
        </>
    )
}
