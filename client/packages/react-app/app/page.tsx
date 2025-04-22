"use client";

import { useEffect, useState } from "react";
import Dashboard from "@/components/@layouts/mainLayout";
import { useAccount } from "wagmi";
import { Link } from "lucide-react";

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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Wallet Not Connected</h1>
        <p className="text-gray-300 mb-6">Please connect your MiniPay wallet to view projects.</p>
        <button
          className="bg-indigo-600 text-white rounded-full py-3 px-6 font-medium"
          onClick={() => window.ethereum?.request({ method: "eth_requestAccounts" })}
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">No Projects to Display</h1>
        <p className="text-gray-300 mb-6">There are currently no campaigns available.</p>
        <Link
          href="/create"
          className="bg-indigo-600 text-white rounded-full py-3 px-6 font-medium"
        >
          Create a Project
        </Link>
      </div>
    );
  }

  return <Dashboard projects={projects} />;
}