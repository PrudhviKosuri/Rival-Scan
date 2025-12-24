import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Mail } from "lucide-react"

interface LoginModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const LoginModal = ({ open, onOpenChange }: LoginModalProps) => {
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false) // Added loading state

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true) // Set loading to true when login starts
        // Simulate login delay
        setTimeout(() => {
            setLoading(false)
            onOpenChange(false)
            navigate("/analysis") // Navigate to analysis page after login
        }, 1500)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-white text-black p-8 rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center mb-6">Sign In</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <Button variant="outline" className="w-full flex items-center justify-center gap-2 py-6 rounded-xl hover:bg-gray-50 border-gray-200" onClick={() => { onOpenChange(false); navigate("/analysis"); }}>
                        <img src="/google-icon.svg" alt="Google" className="w-5 h-5" onError={(e) => e.currentTarget.style.display = 'none'} />
                        <span className="font-medium">Sign in with Google</span>
                    </Button>

                    <Button variant="outline" className="w-full flex items-center justify-center gap-2 py-6 rounded-xl hover:bg-gray-50 border-gray-200" onClick={() => { onOpenChange(false); navigate("/analysis"); }}>
                        <span className="font-medium">Sign in with Microsoft</span>
                    </Button>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="email" className="sr-only">Email</Label>
                            <Input
                                id="email"
                                placeholder="name@example.com"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 rounded-xl border-gray-200 focus:border-blue-500"
                            />
                        </div>
                        <Button type="submit" className="w-full h-12 rounded-xl bg-black text-white hover:bg-gray-800 transition-all text-lg font-medium">
                            Next
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
