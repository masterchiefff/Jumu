"use client"

import { Home, Compass, Wallet, Settings, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";

interface MobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function MobileNavigation({ activeTab, setActiveTab }: MobileNavigationProps) {
  const { isConnected } = useAccount();
  const { connect } = useConnect();
  const router = useRouter();

  const handleCreateClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab("create");

    if (!isConnected) {
      try {
        if (window.ethereum && window.ethereum.isMiniPay) {
          connect({ connector: injected({ target: "metaMask" }) });
        } else {
          throw new Error("MiniPay wallet not detected");
        }
      } catch (error) {
        console.error("Wallet connection failed:", error);
        // Optionally show error in UI
        return;
      }
    }
    router.push("/create");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black px-4 py-3 flex justify-between items-center border-t border-gray-800">
      <Link
        href="/"
        className={`flex flex-col items-center ${activeTab === "home" ? "text-white" : "text-gray-500"}`}
        onClick={() => setActiveTab("home")}
      >
        <Home className="h-5 w-5" />
        <span className="text-xs mt-1">Home</span>
      </Link>
      <Link
        href="/explore"
        className={`flex flex-col items-center ${activeTab === "explore" ? "text-white" : "text-gray-500"}`}
        onClick={() => setActiveTab("explore")}
      >
        <Compass className="h-5 w-5" />
        <span className="text-xs mt-1">Explore</span>
      </Link>
      <button
        onClick={handleCreateClick}
        className="flex items-center justify-center"
      >
        <div
          className={`bg-indigo-600 rounded-full p-3 ${
            activeTab === "create" ? "ring-2 ring-white" : ""
          }`}
        >
          <Plus className="h-6 w-6 text-white" />
        </div>
      </button>
      <Link
        href="/wallet"
        className={`flex flex-col items-center ${activeTab === "wallet" ? "text-white" : "text-gray-500"}`}
        onClick={() => setActiveTab("wallet")}
      >
        <Wallet className="h-5 w-5" />
        <span className="text-xs mt-1">Wallet</span>
      </Link>
      <Link
        href="/settings"
        className={`flex flex-col items-center ${activeTab === "settings" ? "text-white" : "text-gray-500"}`}
        onClick={() => setActiveTab("settings")}
      >
        <Settings className="h-5 w-5" />
        <span className="text-xs mt-1">Settings</span>
      </Link>
    </div>
  );
}