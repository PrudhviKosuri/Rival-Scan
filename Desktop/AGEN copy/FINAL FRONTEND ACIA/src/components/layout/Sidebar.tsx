import { Link, useLocation } from "react-router-dom"
import { BarChart3, TrendingUp, AlertCircle, Zap, BarChart, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  isOpen?: boolean
  onToggle?: () => void
}

export const Sidebar = ({ isOpen = true, onToggle }: SidebarProps) => {
  const location = useLocation()

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { path: "/competitors", label: "Competitors", icon: TrendingUp },
    { path: "/sources", label: "Sources", icon: Zap },
    { path: "/alerts", label: "Alerts", icon: AlertCircle },
    { path: "/insights", label: "Insights", icon: BarChart },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <aside
      className={`${isOpen ? "w-64" : "w-20"} bg-white border-r border-gray-200 h-screen sticky top-0 transition-all duration-300 flex flex-col`}
    >
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className={`flex items-center gap-2 ${!isOpen ? "hidden" : ""}`}>
          <span className="text-xl font-bold text-[#1F2937] font-['Fredoka'] drop-shadow-sm whitespace-nowrap">Rival Scan</span>
        </div>
        {onToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 rounded-lg text-[#1F2937] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${isActive(item.path)
                ? "bg-[#4B6CB7]/10 text-[#4B6CB7]"
                : "text-gray-600 hover:bg-gray-100 hover:text-[#1F2937]"
              } ${!isOpen ? "justify-center" : ""}`}
            title={!isOpen ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-[#1F2937] transition-colors">
          <BarChart3 className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span>Settings</span>}
        </button>
      </div>
    </aside>
  )
}
