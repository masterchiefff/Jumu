"use client";

import { useEffect, useState } from "react";
import Dashboard from "@/components/@layouts/mainLayout";
import { useAccount } from "wagmi";
import { MapPin, Trophy, Star, Plus } from "lucide-react";
import MobileNavigation from "@/components/@shared-components/mobile-navigation";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  imageUrl: string;
  creator: string;
  location: string;
  category: string;
  createdAt: string;
  contributions: { contributor: string; amount: number; timestamp: string }[];
  updates: { message: string; timestamp: string }[];
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("home");
  const { isConnected } = useAccount();

  // Fetch projects from backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://jumu-9cg5.onrender.com/api/campaigns");
        if (!response.ok) {
          throw new Error("Failed to fetch campaigns");
        }
        const data: Project[] = await response.json();
        setProjects(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Categories component for reuse
  const Categories = () => (
    <div className="px-4 py-2">
      <h2 className="text-lg font-bold text-white mb-4">Discover Campaign</h2>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="flex flex-col items-center">
          <div className="bg-gray-800 rounded-full p-3 mb-2">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <span className="text-xs text-gray-300">Near to You</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-gray-800 rounded-full p-3 mb-2">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <span className="text-xs text-gray-300">Leaderboard</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-gray-800 rounded-full p-3 mb-2">
            <Star className="h-5 w-5 text-white" />
          </div>
          <span className="text-xs text-gray-300">Challenge</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-indigo-600 rounded-full p-3 mb-2">
            <Plus className="h-5 w-5 text-white" />
          </div>
          <span className="text-xs text-gray-300">New Projects</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col pb-16 lg:pb-0">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
        </div>
        <div className="lg:hidden">
          <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col pb-16 lg:pb-0">
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-4">Wallet Not Connected</h1>
          <p className="text-gray-300 mb-6">Please connect your MiniPay wallet to view projects.</p>
          <button
            className="bg-indigo-600 text-white rounded-full py-3 px-6 font-medium"
            onClick={() => window.ethereum?.request({ method: "eth_requestAccounts" })}
          >
            Connect Wallet
          </button>
        </div>
        <div className="lg:hidden">
          <Categories />
          <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col pb-16 lg:pb-0">
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-4">No Projects to Display</h1>
          <p className="text-gray-300 mb-6">There are currently no campaigns available.</p>
          <Link
            href="/create"
            className="bg-indigo-600 text-white rounded-full py-3 px-6 font-medium"
          >
            Create a Project
          </Link>
        </div>
        <div className="lg:hidden">
          <Categories />
          <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>
    );
  }

  return <Dashboard projects={projects} activeTab={activeTab} setActiveTab={setActiveTab} />;
}