"use client"

import { useState } from "react"

export default function ConnectWalletButton() {
  const [connecting, setConnecting] = useState<boolean>(false)

  const connectWallet = async () => {
    try {
      setConnecting(true)

      // Simulate wallet connection
      setTimeout(() => {
        setConnecting(false)
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      setConnecting(false)
    }
  }

  return (
    <button
      onClick={connectWallet}
      disabled={connecting}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
    >
      {connecting ? (
        <>
          <span className="animate-spin mr-2">⟳</span>
          Connecting...
        </>
      ) : (
        <>
          <img src="/placeholder.svg?height=16&width=16" alt="MiniPay" className="h-4 w-4 mr-2" />
          Connect MiniPay
        </>
      )}
    </button>
  )
}
