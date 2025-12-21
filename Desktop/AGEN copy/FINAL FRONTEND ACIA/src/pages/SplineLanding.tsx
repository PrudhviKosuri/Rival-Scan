import { useState } from "react"
import SplineCharacter from "../components/SplineCharacter"
import { Button } from "@/components/ui/button"
import { LoginModal } from "../components/LoginModal"

export const SplineLanding = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden font-['Fredoka']">
      <SplineCharacter />

      <div className="absolute top-8 left-8 z-10 select-none">
        <h1 className="text-5xl text-white font-bold drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">RivalScan</h1>
      </div>

      <div className="absolute top-8 right-8 z-10">
        <Button
          onClick={() => setIsLoginOpen(true)}
          className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md px-6 py-2 text-lg rounded-full transition-all duration-300 hover:scale-105"
        >
          Login / Sign In
        </Button>
      </div>

      <LoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} />

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
          <button className="text-white/80 hover:text-white transition-colors text-sm font-medium">Help</button>
          <button className="text-white/80 hover:text-white transition-colors text-sm font-medium">About</button>
          <button className="text-white/80 hover:text-white transition-colors text-sm font-medium">Contact</button>
          <button className="text-white/80 hover:text-white transition-colors text-sm font-medium">Privacy</button>
        </div>
      </div>
    </div>
  )
}

export default SplineLanding
