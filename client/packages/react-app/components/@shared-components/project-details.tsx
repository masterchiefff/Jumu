"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, MoreVertical, User, Calendar, CheckCircle, Check } from "lucide-react";
import { useAccount, useWriteContract } from "wagmi";
import MobileNavigation from "@/components/@shared-components/mobile-navigation";
import DesktopSidebar from "@/components/@shared-components/desktop-sidebar";
import ConnectWalletButton from "@/components/@shared-components/connect-wallet-button";
import { calculateProgress, getProgressColor, weiToCUSD } from "@/lib/utils";

// CampaignFactory ABI (subset for contribute)
const campaignFactoryABI = [
  {
    inputs: [
      { internalType: "string", name: "_id", type: "string" },
    ],
    name: "contribute",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

// Replace with your deployed CampaignFactory contract address
const CONTRACT_ADDRESS = "0xYourContractAddress";

interface Contribution {
  contributor: string;
  amount: number;
  timestamp: string;
}

interface Update {
  message: string;
  timestamp: string;
}

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
  contributions: Contribution[];
  updates: Update[];
}

export default function ProjectDetailsPage({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [contributionAmount, setContributionAmount] = useState<string>("50");
  const [isPaymentScreenOpen, setIsPaymentScreenOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("home");
  const [error, setError] = useState<string>("");
  const { address, isConnected } = useAccount();
  const router = useRouter();

  // Wagmi hook for contract write
  const { writeContract, isPending: isTxPending, error: txError } = useWriteContract();

  // Fetch project data from backend
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3001/api/campaigns/${projectId}`);
        if (!response.ok) {
          throw new Error("Campaign not found");
        }
        const data: Project = await response.json();
        setProject(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch project data:", err);
        setError("Failed to load project details");
        setLoading(false);
        router.push("/");
      }
    };

    fetchProjectData();
  }, [projectId, router]);

  // Handle transaction errors
  useEffect(() => {
    if (txError) {
      setError(`Transaction failed: ${txError.message}`);
    }
  }, [txError]);

  // Open payment screen
  const openPaymentScreen = () => {
    if (!isConnected) {
      alert("Please connect your MiniPay wallet to donate.");
      return;
    }
    setIsPaymentScreenOpen(true);
  };

  // Close payment screen
  const closePaymentScreen = () => {
    setIsPaymentScreenOpen(false);
    setError("");
  };

  // Handle payment
  const handlePayment = () => {
    if (!project || !contributionAmount || !isConnected || !address) {
      setError("Please ensure wallet is connected and amount is valid");
      return;
    }

    // Validate contribution amount
    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid donation amount");
      return;
    }

    const amountInWei = BigInt(amount * 1e18);
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: campaignFactoryABI,
      functionName: "contribute",
      args: [project.id],
      value: amountInWei,
      chainId: 44787, // Alfajores chain ID
    });
  };

  if (loading || !project) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  const progress = calculateProgress(project.currentAmount, project.targetAmount);

  // Render the details screen
  const renderDetailsScreen = () => {
    return (
      <div className="flex flex-col h-full bg-indigo-600">
        {/* Header */}
        <div className="px-4 py-3 flex justify-between items-center">
          <button className="bg-black bg-opacity-30 rounded-full p-2" onClick={() => router.push("/")}>
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          <h2 className="text-white font-medium">Details</h2>
          <button className="bg-black bg-opacity-30 rounded-full p-2">
            <MoreVertical className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Project image */}
        <div className="flex justify-center items-center p-6 relative">
          <div className="absolute inset-0 bg-indigo-500 opacity-50 pattern-dots pattern-indigo-400 pattern-bg-indigo-600 pattern-size-4"></div>
          <img
            src={project.imageUrl || "/placeholder.svg"}
            alt={project.title}
            className="h-48 object-contain relative z-10"
          />
        </div>

        {/* Project details */}
        <div className="flex-1 bg-black rounded-t-3xl p-5 overflow-auto">
          <h1 className="text-xl font-bold text-white mb-3">{project.title}</h1>

          <div className="flex items-center text-sm text-gray-300 mb-3">
            <User className="h-4 w-4 mr-1" />
            <span>{project.contributions.length} Backers</span>
            <span className="mx-2">•</span>
            <span>
              {weiToCUSD(project.currentAmount)} cUSD raised from {weiToCUSD(project.targetAmount)} cUSD
            </span>
          </div>

          <div className="w-full bg-gray-800 rounded-full h-1.5 mb-4 relative">
            <div className={`h-1.5 rounded-full ${getProgressColor(progress)}`} style={{ width: `${progress}%` }}></div>
            <div className="absolute left-0 top-3 text-xs text-gray-400">0%</div>
            <div className="absolute right-0 top-3 text-xs text-gray-400">100%</div>
            <div
              className="absolute top-3 text-xs text-white"
              style={{ left: `${progress}%`, transform: "translateX(-50%)" }}
            >
              {progress}%
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 mb-4">
            <h3 className="text-white font-medium mb-2">Organized by</h3>
            <div className="flex items-center">
              <div className="bg-gray-800 rounded-full h-10 w-10 flex items-center justify-center mr-3">
                <User className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center">
                  <p className="text-white font-medium">Sazara Tech Foundation</p>
                  <CheckCircle className="h-4 w-4 text-blue-400 ml-1" />
                </div>
                <p className="text-xs text-gray-400">Official DuCrowd&apos;s Partner</p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-white font-medium mb-2">Backers</h3>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex">
                  {project.contributions.slice(0, 5).map((_, i) => (
                    <div
                      key={i}
                      className="bg-gray-800 rounded-full h-8 w-8 flex items-center justify-center -ml-2 first:ml-0 border-2 border-gray-900"
                    >
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                  {project.contributions.length > 5 && (
                    <div className="bg-indigo-600 rounded-full h-8 w-8 flex items-center justify-center -ml-2 border-2 border-gray-900">
                      <span className="text-xs text-white font-medium">{project.contributions.length}+</span>
                    </div>
                  )}
                </div>
                <button className="text-sm text-indigo-400">View People</button>
              </div>
              <p className="text-sm text-gray-400 mt-2">{project.contributions.length} people donated</p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-white font-medium mb-2">Purpose</h3>
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-sm text-gray-300">{project.description}</p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-white font-medium mb-2">Recent Updates</h3>
            <div className="bg-gray-900 rounded-lg p-4 space-y-3">
              {project.updates.length > 0 ? (
                project.updates.map((update, index) => (
                  <div key={index} className="flex items-start">
                    <div className="mt-1 mr-3">
                      <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-300">{update.message}</p>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {update.timestamp}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No updates yet</p>
              )}
            </div>
          </div>

          <button
            className="w-full bg-indigo-600 text-white rounded-full py-3 font-medium mb-4"
            onClick={openPaymentScreen}
          >
            Donate with MiniPay
          </button>
        </div>
      </div>
    );
  };

  // Render the payment screen
  const renderPaymentScreen = () => {
    return (
      <div className="flex flex-col bg-black pb-16">
        {/* Header */}
        <div className="px-4 py-3 flex justify-between items-center">
          <button className="rounded-full p-2" onClick={closePaymentScreen}>
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          <h2 className="text-white font-medium">Payment</h2>
          <div className="w-5"></div>
        </div>

        {/* Amount selection */}
        <div className="px-4 mb-6">
          <h3 className="text-white font-medium mb-3">Select Amount (cUSD)</h3>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <button
              className={`p-4 rounded-lg text-center ${contributionAmount === "50" ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-300"}`}
              onClick={() => setContributionAmount("50")}
            >
              {contributionAmount === "50" && (
                <div className="flex items-center justify-center mb-2">
                  <div className="h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-xs ml-1">Selected</span>
                </div>
              )}
              <span className="text-xl font-bold block">50 cUSD</span>
            </button>
            <button
              className={`p-4 rounded-lg text-center ${contributionAmount === "100" ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-300"}`}
              onClick={() => setContributionAmount("100")}
            >
              <span className="text-xl font-bold block">100 cUSD</span>
            </button>
            <button
              className={`p-4 rounded-lg text-center ${contributionAmount === "200" ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-300"}`}
              onClick={() => setContributionAmount("200")}
            >
              <span className="text-xl font-bold block">200 cUSD</span>
            </button>
          </div>

          <div className="text-center text-gray-500 text-sm mb-3">or</div>

          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <input
              type="text"
              placeholder="Enter Amount Manually"
              className="bg-transparent text-white text-center w-full focus:outline-none"
              value={
                contributionAmount !== "50" && contributionAmount !== "100" && contributionAmount !== "200"
                  ? contributionAmount
                  : ""
              }
              onChange={(e) => setContributionAmount(e.target.value)}
            />
          </div>
        </div>

        {/* Payment method */}
        <div className="px-4 mb-6">
          <h3 className="text-white font-medium mb-3">Payment Method</h3>

          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <img src="/minipay-logo.svg" alt="MiniPay" className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-white font-medium">MiniPay Wallet</p>
                  <p className="text-xs text-gray-400">Pay with cUSD via your connected MiniPay wallet</p>
                </div>
              </div>
              <div className="h-5 w-5 rounded-full border-2 border-indigo-500 flex items-center justify-center">
                <div className="h-3 w-3 bg-indigo-500 rounded-full"></div>
              </div>
            </div>

            <p className="text-xs text-gray-400 mb-3">
              Your donation will be processed securely via MiniPay.
            </p>
          </div>

          {error && (
            <div className="bg-red-900 text-red-200 p-4 rounded-lg mb-4 flex items-start">
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Pay button */}
        <div className="px-4 pb-8 mt-4">
          <div className="flex gap-3">
            <button
              className="w-1/2 bg-gray-800 text-white rounded-full py-3 font-medium"
              onClick={closePaymentScreen}
            >
              Cancel
            </button>
            <button
              className="w-1/2 bg-indigo-600 text-white rounded-full py-3 font-medium disabled:opacity-70"
              onClick={handlePayment}
              disabled={isTxPending}
            >
              {isTxPending ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></span>
                  Processing...
                </span>
              ) : (
                `Donate ${contributionAmount} cUSD`
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

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
            <button
              className="flex items-center text-gray-300 hover:text-white"
              onClick={() => router.push("/")}
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              <span>Back to Projects</span>
            </button>
            <ConnectWalletButton />
          </div>

          {/* Project details */}
          <div className="flex h-[calc(100vh-73px)]">
            <div className="w-1/2 bg-indigo-600 p-6">
              <div className="relative h-full flex flex-col">
                <div className="absolute inset-0 bg-indigo-500 opacity-50 pattern-dots pattern-indigo-400 pattern-bg-indigo-600 pattern-size-4 rounded-xl"></div>
                <div className="relative z-10 flex-1 flex items-center justify-center">
                  <img
                    src={project.imageUrl || "/placeholder.svg"}
                    alt={project.title}
                    className="max-h-80 max-w-full object-contain"
                  />
                </div>
                <div className="relative z-10 mt-4">
                  <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
                  <div className="flex items-center text-white mb-4">
                    <User className="h-4 w-4 mr-1" />
                    <span>{project.contributions.length} Backers</span>
                    <span className="mx-2">•</span>
                    <span>
                      {weiToCUSD(project.currentAmount)} cUSD raised from {weiToCUSD(project.targetAmount)} cUSD
                    </span>
                  </div>
                  <div className="w-full bg-indigo-800 bg-opacity-50 rounded-full h-2 mb-2">
                    <div className="h-2 rounded-full bg-white" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="flex justify-between text-sm text-white">
                    <span>{progress}% Complete</span>
                    <span>{weiToCUSD(project.targetAmount - project.currentAmount)} cUSD to go</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-1/2 p-6 overflow-auto">
              {!isPaymentScreenOpen ? (
                <div>
                  <div className="bg-gray-900 rounded-lg p-4 mb-6">
                    <h3 className="text-white font-medium mb-2">Organized by</h3>
                    <div className="flex items-center">
                      <div className="bg-gray-800 rounded-full h-10 w-10 flex items-center justify-center mr-3">
                        <User className="h-5 w-5 text-indigo-400" />
                      </div>
                      <div>
                        <div className="flex items-center">
                          <p className="text-white font-medium">Sazara Tech Foundation</p>
                          <CheckCircle className="h-4 w-4 text-blue-400 ml-1" />
                        </div>
                        <p className="text-xs text-gray-400">Official DuCrowd&apos;s Partner</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-white font-medium mb-3">Purpose</h3>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <p className="text-gray-300">{project.description}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-white font-medium mb-3">Recent Updates</h3>
                    <div className="bg-gray-900 rounded-lg p-4 space-y-4">
                      {project.updates.length > 0 ? (
                        project.updates.map((update, index) => (
                          <div key={index} className="flex items-start">
                            <div className="mt-1 mr-3">
                              <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-300">{update.message}</p>
                              <p className="text-xs text-gray-500 flex items-center mt-1">
                                <Calendar className="h-3 w-3 mr-1" />
                                {update.timestamp}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No updates yet</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-white font-medium mb-3">Recent Contributions</h3>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <div className="space-y-3 max-h-40 overflow-y-auto">
                        {project.contributions.length > 0 ? (
                          project.contributions.map((contribution, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="bg-gray-800 rounded-full h-8 w-8 flex items-center justify-center mr-2">
                                  <User className="h-4 w-4 text-gray-400" />
                                </div>
                                <div>
                                  <p className="text-sm text-white">{contribution.contributor}</p>
                                  <p className="text-xs text-gray-500">{contribution.timestamp}</p>
                                </div>
                              </div>
                              <p className="text-sm font-medium text-indigo-400">
                                {weiToCUSD(contribution.amount)} cUSD
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">No contributions yet</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    className="w-full bg-indigo-600 text-white rounded-full py-3 font-medium"
                    onClick={openPaymentScreen}
                  >
                    Donate with MiniPay
                  </button>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold text-white mb-6">Donate to {project.title}</h2>

                  <div className="bg-gray-900 rounded-lg p-4 mb-6">
                    <h3 className="text-white font-medium mb-3">Select Amount (cUSD)</h3>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <button
                        className={`p-4 rounded-lg text-center ${contributionAmount === "50" ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-300"}`}
                        onClick={() => setContributionAmount("50")}
                      >
                        <span className="text-xl font-bold block">50 cUSD</span>
                      </button>
                      <button
                        className={`p-4 rounded-lg text-center ${contributionAmount === "100" ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-300"}`}
                        onClick={() => setContributionAmount("100")}
                      >
                        <span className="text-xl font-bold block">100 cUSD</span>
                      </button>
                      <button
                        className={`p-4 rounded-lg text-center ${contributionAmount === "200" ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-300"}`}
                        onClick={() => setContributionAmount("200")}
                      >
                        <span className="text-xl font-bold block">200 cUSD</span>
                      </button>
                    </div>

                    <div className="text-center text-gray-500 text-sm mb-3">or</div>

                    <div className="bg-gray-800 rounded-lg p-3 text-center">
                      <input
                        type="text"
                        placeholder="Enter Amount Manually"
                        className="bg-transparent text-white text-center w-full focus:outline-none"
                        value={
                          contributionAmount !== "50" && contributionAmount !== "100" && contributionAmount !== "200"
                            ? contributionAmount
                            : ""
                        }
                        onChange={(e) => setContributionAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4 mb-6">
                    <h3 className="text-white font-medium mb-3">Payment Method</h3>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center mr-3">
                          <img src="/minipay-logo.svg" alt="MiniPay" className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-white font-medium">MiniPay Wallet</p>
                          <p className="text-xs text-gray-400">Pay with cUSD via your connected MiniPay wallet</p>
                        </div>
                      </div>
                      <div className="h-5 w-5 rounded-full border-2 border-indigo-500 flex items-center justify-center">
                        <div className="h-3 w-3 bg-indigo-500 rounded-full"></div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 mb-3">
                      Your donation will be processed securely via MiniPay.
                    </p>

                    {error && (
                      <div className="bg-red-900 text-red-200 p-4 rounded-lg mb-4 flex items-start">
                        <p>{error}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      className="w-1/2 bg-gray-800 text-white rounded-full py-3 font-medium"
                      onClick={closePaymentScreen}
                    >
                      Cancel
                    </button>
                    <button
                      className="w-1/2 bg-indigo-600 text-white rounded-full py-3 font-medium disabled:opacity-70"
                      onClick={handlePayment}
                      disabled={isTxPending}
                    >
                      {isTxPending ? (
                        <span className="flex items-center justify-center">
                          <span className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></span>
                          Processing...
                        </span>
                      ) : (
                        `Donate ${contributionAmount} cUSD`
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden min-h-screen flex flex-col">
        <div className="flex-1 overflow-auto">
          {!isPaymentScreenOpen ? renderDetailsScreen() : renderPaymentScreen()}
        </div>

        {/* Bottom navigation (always visible) */}
        <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}