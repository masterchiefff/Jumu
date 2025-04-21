"use client"

import { Home, Compass, Wallet, Settings, User, PlusCircle } from "lucide-react"
import Link from "next/link"
import { useWeb3 } from "@/contexts/useWeb3"

interface DesktopSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function DesktopSidebar({ activeTab, setActiveTab }: DesktopSidebarProps) {
  const { address } = useWeb3()

  // Function to truncate wallet address for display
  const truncateAddress = (addr: string | null) => {
    if (!addr) return "Not Connected"
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className="w-64 border-r border-gray-800 h-full flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-indigo-500">BuildPulse</h1>
        <p className="text-sm text-gray-400">Fund It, Track It, Build It Together</p>
      </div>

      <div className="p-4">
        <div className="bg-indigo-600 rounded-xl p-4 mb-4">
          <div className="flex items-center mb-1">
            <img src="/placeholder.svg?height=20&width=20" alt="MiniPay" className="h-5 w-5 mr-2" />
            <p className="text-indigo-200 text-sm">MiniPay Balance</p>
          </div>
          <h2 className="text-white text-2xl font-bold">1,200.89 cUSD</h2>
          <div className="flex items-center mt-2">
            <div className="flex">
              <span className="h-1 w-1 bg-white rounded-full mx-0.5"></span>
              <span className="h-1 w-1 bg-white rounded-full mx-0.5"></span>
              <span className="h-1 w-1 bg-white rounded-full mx-0.5"></span>
              <span className="h-1 w-1 bg-white rounded-full mx-0.5"></span>
            </div>
            <span className="text-white text-xs ml-1">8973</span>
          </div>
          <p className="text-indigo-200 text-xs mt-1">
            {address ? "Connected to MiniPay" : "MiniPay Not Connected"}
          </p>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <Link
              href="/"
              className={`w-full flex items-center p-2 rounded-lg ${
                activeTab === "home" ? "bg-indigo-600 text-white" : "text-gray-300 hover:bg-gray-800"
              }`}
              onClick={() => setActiveTab("home")}
            >
              <Home className="h-5 w-5 mr-3" />
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link
              href="/explore"
              className={`w-full flex items-center p-2 rounded-lg ${
                activeTab === "explore" ? "bg-indigo-600 text-white" : "text-gray-300 hover:bg-gray-800"
              }`}
              onClick={() => setActiveTab("explore")}
            >
              <Compass className="h-5 w-5 mr-3" />
              <span>Explore</span>
            </Link>
          </li>
          <li>
            <Link
              href="/wallet"
              className={`w-full flex items-center p-2 rounded-lg ${
                activeTab === "wallet" ? "bg-indigo-600 text-white" : "text-gray-300 hover:bg-gray-800"
              }`}
              onClick={() => setActiveTab("wallet")}
            >
              <Wallet className="h-5 w-5 mr-3" />
              <span>Wallet</span>
            </Link>
          </li>
          <li>
            <Link
              href="/create"
              className={`w-full flex items-center p-2 rounded-lg ${
                activeTab === "create" ? "bg-indigo-600 text-white" : "text-gray-300 hover:bg-gray-800"
              }`}
              onClick={() => setActiveTab("create")}
            >
              <PlusCircle className="h-5 w-5 mr-3" />
              <span>Create Project</span>
            </Link>
          </li>
          <li>
            <Link
              href="/settings"
              className={`w-full flex items-center p-2 rounded-lg ${
                activeTab === "settings" ? "bg-indigo-600 text-white" : "text-gray-300 hover:bg-gray-800"
              }`}
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="h-5 w-5 mr-3" />
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-indigo-800 flex items-center justify-center mr-3">
            <User className="h-5 w-5 text-indigo-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{truncateAddress(address)}</p>
            <p className="text-xs text-gray-400">
              {address ? "MiniPay Connected" : "MiniPay Not Connected"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}