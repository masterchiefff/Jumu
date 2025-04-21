"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter, User } from "lucide-react"
import { MOCK_PROJECTS } from "@/lib/mock-data"
import { calculateProgress, getProgressColor, weiToCUSD } from "@/lib/utils"
import MobileNavigation from "@/components/@shared-components/mobile-navigation"
import DesktopSidebar from "@/components/@shared-components/desktop-sidebar"

export default function ExplorePage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("explore")
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const router = useRouter()

  // Initialize data
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true)
        // In a real app, we would fetch from the blockchain
        setProjects(MOCK_PROJECTS)
        setLoading(false)
      } catch (error) {
        console.error("Failed to initialize data:", error)
        setLoading(false)
      }
    }

    initData()
  }, [])

  // Handle project selection
  const selectProject = (projectId: number) => {
    router.push(`/project/${projectId}`)
  }

  // Filter projects
  const filteredProjects = projects
    .filter((project) => {
      if (activeFilter === "all") return true
      if (activeFilter === "funding" && project.status === 0) return true
      if (activeFilter === "inProgress" && project.status === 1) return true
      if (activeFilter === "completed" && project.status === 2) return true
      return false
    })
    .filter((project) => {
      if (!searchQuery) return true
      return (
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })

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
            <h1 className="text-xl font-bold">Explore Projects</h1>
            <div className="flex-1 bg-gray-800 rounded-full px-4 py-2 flex items-center max-w-md ml-6">
              <Search className="h-4 w-4 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search projects"
                className="bg-transparent text-white text-sm w-full focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="ml-4 p-2 bg-gray-800 rounded-full">
              <Filter className="h-5 w-5 text-gray-300" />
            </button>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex space-x-2">
              <button
                className={`px-4 py-2 rounded-full text-sm ${activeFilter === "all" ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-300"}`}
                onClick={() => setActiveFilter("all")}
              >
                All Projects
              </button>
              <button
                className={`px-4 py-2 rounded-full text-sm ${activeFilter === "funding" ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-300"}`}
                onClick={() => setActiveFilter("funding")}
              >
                Funding
              </button>
              <button
                className={`px-4 py-2 rounded-full text-sm ${activeFilter === "inProgress" ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-300"}`}
                onClick={() => setActiveFilter("inProgress")}
              >
                In Progress
              </button>
              <button
                className={`px-4 py-2 rounded-full text-sm ${activeFilter === "completed" ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-300"}`}
                onClick={() => setActiveFilter("completed")}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Projects grid */}
          <div className="p-6 overflow-auto h-[calc(100vh-145px)]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => selectProject(project.id)}
                    className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors"
                  >
                    <div className="mb-3">
                      <img
                        src={project.image || "/placeholder.svg"}
                        alt={project.title}
                        className="w-full h-40 object-cover rounded-md"
                      />
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-white text-lg">{project.title}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full text-white ${
                          project.status === 0
                            ? "bg-indigo-500"
                            : project.status === 1
                              ? "bg-amber-500"
                              : "bg-green-500"
                        }`}
                      >
                        {project.status === 0 ? "Funding" : project.status === 1 ? "In Progress" : "Completed"}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{project.description}</p>
                    <div className="flex items-center text-xs text-gray-400 mb-2">
                      <User className="h-3 w-3 mr-1" />
                      <span>14K Backers</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5 mb-1">
                      <div
                        className={`h-1.5 rounded-full ${getProgressColor(calculateProgress(project.currentAmount, project.targetAmount))}`}
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
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="bg-gray-800 rounded-full p-6 mb-4">
                  <Search className="h-10 w-10 text-gray-600" />
                </div>
                <h2 className="text-xl font-bold mb-2">No projects found</h2>
                <p className="text-gray-400 text-center">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden min-h-screen flex flex-col pb-16">
        {/* Header */}
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="flex-1 bg-gray-800 rounded-full px-4 py-2 flex items-center">
            <Search className="h-4 w-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search projects"
              className="bg-transparent text-white text-sm w-full focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="p-2 bg-gray-800 rounded-full">
            <Filter className="h-5 w-5 text-gray-300" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-4 py-2 overflow-x-auto">
          <div className="flex space-x-2 w-max">
            <button
              className={`px-4 py-2 rounded-full text-sm ${activeFilter === "all" ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-300"}`}
              onClick={() => setActiveFilter("all")}
            >
              All Projects
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm ${activeFilter === "funding" ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-300"}`}
              onClick={() => setActiveFilter("funding")}
            >
              Funding
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm ${activeFilter === "inProgress" ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-300"}`}
              onClick={() => setActiveFilter("inProgress")}
            >
              In Progress
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm ${activeFilter === "completed" ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-300"}`}
              onClick={() => setActiveFilter("completed")}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Projects list */}
        <div className="px-4 py-2 flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="space-y-4">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => selectProject(project.id)}
                  className="bg-gray-800 rounded-lg p-4 flex gap-3"
                >
                  <img
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    className="h-16 w-24 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-white text-sm">{project.title}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full text-white ${
                          project.status === 0
                            ? "bg-indigo-500"
                            : project.status === 1
                              ? "bg-amber-500"
                              : "bg-green-500"
                        }`}
                      >
                        {project.status === 0 ? "Funding" : project.status === 1 ? "In Progress" : "Completed"}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-400 mt-1">
                      <User className="h-3 w-3 mr-1" />
                      <span>14K Backers</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                      <div
                        className={`h-1.5 rounded-full ${getProgressColor(calculateProgress(project.currentAmount, project.targetAmount))}`}
                        style={{ width: `${calculateProgress(project.currentAmount, project.targetAmount)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{weiToCUSD(project.currentAmount)} cUSD</span>
                      <span>{weiToCUSD(project.targetAmount)} cUSD</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="bg-gray-800 rounded-full p-6 mb-4">
                <Search className="h-10 w-10 text-gray-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">No projects found</h2>
              <p className="text-gray-400 text-center">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Bottom navigation */}
        <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  )
}
