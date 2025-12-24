import { ReactNode } from "react"
import { Check } from "lucide-react"

interface TrackingFormSectionProps {
    number: number
    title: string
    subtitle: string
    children: ReactNode
}

export const TrackingFormSection = ({ number, title, subtitle, children }: TrackingFormSectionProps) => {
    return (
        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg">
                    {number}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
                    <p className="text-gray-500 text-sm">{subtitle}</p>
                </div>
            </div>
            <div className="pl-12">
                {children}
            </div>
        </div>
    )
}
