"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, Clock, User, MapPin, Trophy, Star, Plus, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useAccount, useConnect } from "wagmi";
import MobileNavigation from "@/components/@shared-components/mobile-navigation";
import DesktopSidebar from "@/components/@shared-components/desktop-sidebar";
import ConnectWalletButton from "@/components/@shared-components/connect-wallet-button";
import { calculateProgress, getProgressColor, weiToCUSD } from "@/lib/utils";

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

interface DashboardProps {
  projects: Project[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Dashboard({ projects, activeTab, setActiveTab }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hideConnectBtn, setHideConnectBtn] = useState<boolean>(false);
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  // Auto-connect MiniPay wallet if available
  useEffect(() => {
    if (window.ethereum && window.ethereum.isMiniPay) {
      setHideConnectBtn(true);
      const miniPayConnector = connectors.find((c) => c.id === "injected");
      if (miniPayConnector && !isConnected) {
        connect({ connector: miniPayConnector });
      }
    }
  }, [connect, connectors, isConnected]);

  // Navigate to project details
  const selectProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

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

  if (!isConnected) {
    return null; // Handled by Home component
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Desktop layout */}
      <div className="hidden lg:flex h-screen">
        {/* Sidebar */}
        <DesktopSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex-1 bg-gray-800 rounded-full px-4 py-2 flex items-center max-w-md">
              <Search className="h-4 w-4 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search campaigns"
                className="bg-transparent text-white text-sm w-full focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4 ml-4">
              <button className="p-2 relative">
                <Bell className="h-5 w-5 text-gray-300" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <Link
                href="/create"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Create Project</span>
              </Link>
              {!hideConnectBtn && <ConnectWalletButton />}
            </div>
          </div>

          {/* Projects grid */}
          <div className="p-6 overflow-auto h-[calc(100vh-73px)]">
            <h1 className="text-2xl font-bold mb-6">Discover Projects</h1>

            {/* Featured project */}
            {projects.length > 0 && (
              <div
                className="bg-indigo-600 rounded-xl p-4 relative overflow-hidden mb-8 cursor-pointer"
                onClick={() => selectProject(projects[0].id)}
              >
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-indigo-500 opacity-50 pattern-dots pattern-indigo-400 pattern-bg-indigo-600 pattern-size-4"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <div className="bg-indigo-800 bg-opacity-70 rounded-full px-3 py-1 text-xs text-white flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Almost done</span>
                    </div>
                    <div className="bg-indigo-800 bg-opacity-70 rounded-full px-3 py-1 text-xs text-white flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>12h left</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex justify-center items-center">
                      <img
                        src={projects[0].imageUrl || "/placeholder.svg"}
                        alt={projects[0].title}
                        className="h-48 object-contain"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h3 className="text-2xl font-bold text-white mb-2">{projects[0].title}</h3>
                      <p className="text-white text-sm mb-3">{projects[0].description}</p>
                      <div className="flex items-center text-xs text-white mb-2">
                        <User className="h-3 w-3 mr-1" />
                        <span>{projects[0].contributions.length} Backers</span>
                        <span className="mx-2">•</span>
                        <span>
                          {weiToCUSD(projects[0].currentAmount)} cUSD raised from {weiToCUSD(projects[0].targetAmount)}{" "}
                          cUSD
                        </span>
                      </div>

                      <div className="w-full bg-indigo-800 bg-opacity-50 rounded-full h-1.5 mb-3">
                        <div
                          className="h-1.5 rounded-full bg-white"
                          style={{
                            width: `${calculateProgress(projects[0].currentAmount, projects[0].targetAmount)}%`,
                          }}
                        ></div>
                      </div>

                      <button
                        className="w-full bg-black text-white rounded-full py-3 font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectProject(projects[0].id);
                        }}
                      >
                        Donate Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <h2 className="text-xl font-bold mb-4">Categories</h2>
            <div className="grid grid-cols-4 gap-4 mb-8">
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

            <h2 className="text-xl font-bold mb-4">All Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.slice(1).map((project) => (
                <div
                  key={project.id}
                  onClick={() => selectProject(project.id)}
                  className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors"
                >
                  <div className="mb-3">
                    <img
                      src={project.imageUrl || "/placeholder.svg"}
                      alt={project.title}
                      className="w-full h-40 object-cover rounded-md"
                    />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-1">{project.title}</h3>
                  <div className="flex items-center text-xs text-gray-400 mb-2">
                    <User className="h-3 w-3 mr-1" />
                    <span>{project.contributions.length} Backers</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5 mb-1">
                    <div
                      className={`h-1.5 rounded-full ${getProgressColor(
                        calculateProgress(project.currentAmount, project.targetAmount)
                      )}`}
                      style={{ width: `${calculateProgress(project.currentAmount, project.targetAmount)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{weiToCUSD(project.currentAmount)} cUSD</span>
                    <span>{weiToCUSD(project.targetAmount)} cUSD</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden min-h-screen flex flex-col pb-16">
        {/* Search bar */}
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="flex-1 bg-gray-800 rounded-full px-4 py-2 flex items-center">
            <Search className="h-4 w-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search campaign"
              className="bg-transparent text-white text-sm w-full focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="p-2 relative">
            <Bell className="h-5 w-5 text-gray-300" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
        </div>

        {/* Featured project */}
        <div className="px-4 py-2">
          {projects.length > 0 && (
            <div
              className="bg-indigo-600 rounded-xl p-4 relative overflow-hidden"
              onClick={() => selectProject(projects[0].id)}
            >
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-indigo-500 opacity-50 pattern-dots pattern-indigo-400 pattern-bg-indigo-600 pattern-size-4"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <div className="bg-indigo-800 bg-opacity-70 rounded-full px-3 py-1 text-xs text-white flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Almost done</span>
                  </div>
                  <div className="bg-indigo-800 bg-opacity-70 rounded-full px-3 py-1 text-xs text-white flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>12h left</span>
                  </div>
                </div>

                <div className="flex justify-center my-4">
                  <img
                    src={projects[0].imageUrl || "/placeholder.svg"}
                    alt={projects[0].title}
                    className="h-40 object-contain"
                  />
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{projects[0].title}</h3>

                <div className="flex items-center text-xs text-white mb-2">
                  <User className="h-3 w-3 mr-1" />
                  <span>{projects[0].contributions.length} Backers</span>
                  <span className="mx-2">•</span>
                  <span>
                    {weiToCUSD(projects[0].currentAmount)} cUSD raised from {weiToCUSD(projects[0].targetAmount)} cUSD
                  </span>
                </div>

                <div className="w-full bg-indigo-800 bg-opacity-50 rounded-full h-1.5 mb-3">
                  <div
                    className="h-1.5 rounded-full bg-white"
                    style={{ width: `${calculateProgress(projects[0].currentAmount, projects[0].targetAmount)}%` }}
                  ></div>
                </div>

                <button
                  className="w-full bg-black text-white rounded-full py-3 font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    selectProject(projects[0].id);
                  }}
                >
                  Donate Now
                </button>
              </div>
            </div>
          )}
        </div>

        <Categories />

        {/* Other projects */}
        <div className="px-4 py-2 flex-1 overflow-auto">
          <div className="space-y-4">
            {projects.slice(1).map((project) => (
              <div
                key={project.id}
                onClick={() => selectProject(project.id)}
                className="bg-gray-800 rounded-lg p-4 flex gap-3"
              >
                <img
                  src={project.imageUrl || "/placeholder.svg"}
                  alt={project.title}
                  className="h-16 w-24 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-white text-sm">{project.title}</h3>
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    <User className="h-3 w-3 mr-1" />
                    <span>{project.contributions.length} Backers</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                    <div
                      className={`h-1.5 rounded-full ${getProgressColor(
                        calculateProgress(project.currentAmount, project.targetAmount)
                      )}`}
                      style={{ width: `${calculateProgress(project.currentAmount, project.targetAmount)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom navigation */}
        <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}