"use client"

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Upload, X, AlertCircle } from "lucide-react";
import MobileNavigation from "@/components/@shared-components/mobile-navigation";
import DesktopSidebar from "@/components/@shared-components/desktop-sidebar";
import ConnectWalletButton from "@/components/@shared-components/connect-wallet-button";
import WalletPopup from "@/components/@shared-components/walletPopup";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";

// Define types for API response and error
interface CampaignResponse {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  location: string;
  category: string;
  imageUrl: string;
  creator: string;
  createdAt: string;
}

interface ApiError {
  error: Array<{ message: string; path: string[] }> | string;
}

export default function CreateCampaignPage() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [targetAmount, setTargetAmount] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showWalletPopup, setShowWalletPopup] = useState<boolean>(false);
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const router = useRouter();

  useEffect(() => {
    if (window.ethereum && window.ethereum.isMiniPay && !isConnected) {
      connect({ connector: injected({ target: "metaMask" }) });
    }
  }, [isConnected, connect]);

  useEffect(() => {
    if (isConnected && address) {
      setShowWalletPopup(true);
    }
  }, [isConnected, address]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview("");
    setImageFile(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!isConnected) {
      try {
        if (window.ethereum && window.ethereum.isMiniPay) {
          connect({ connector: injected({ target: "metaMask" }) });
        } else {
          throw new Error("MiniPay wallet not detected");
        }
      } catch (err) {
        setError("Failed to connect MiniPay wallet");
        setIsSubmitting(false);
        return;
      }
    }

    if (!address) {
      setError("No wallet address available");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("targetAmount", targetAmount);
    formData.append("location", location);
    formData.append("category", category);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const response = await fetch("https://jumu-9cg5.onrender.com/api/campaigns", {
        method: "POST",
        body: formData,
        headers: {
          "X-MiniPay-Wallet": address,
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        if (Array.isArray(errorData.error)) {
          throw new Error(errorData.error.map((err) => err.message).join(", "));
        }
        throw new Error(errorData.error || "Failed to create campaign");
      }

      const data: CampaignResponse = await response.json();
      console.log("Campaign created:", data);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <WalletPopup
        isOpen={showWalletPopup}
        onClose={() => setShowWalletPopup(false)}
        walletAddress={address}
      />
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
              <span>Back to Campaigns</span>
            </button>
            {!isConnected && <ConnectWalletButton />}
          </div>

          {/* Form */}
          <div className="p-6 overflow-auto h-[calc(100vh-73px)]">
            {isConnected ? (
              <div>
                <h1 className="text-2xl font-bold mb-6">Create New Campaign</h1>
                {error && (
                  <div className="bg-red-900 text-red-200 p-4 rounded-lg mb-6 flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <div className="mb-6">
                        <label
                          htmlFor="title"
                          className="block text-sm font-medium text-gray-300 mb-2"
                        >
                          Campaign Title
                        </label>
                        <input
                          id="title"
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter campaign title"
                          required
                        />
                      </div>

                      <div className="mb-6">
                        <label
                          htmlFor="description"
                          className="block text-sm font-medium text-gray-300 mb-2"
                        >
                          Campaign Description
                        </label>
                        <textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32"
                          placeholder="Describe your campaign in detail"
                          required
                        />
                      </div>

                      <div className="mb-6">
                        <label
                          htmlFor="targetAmount"
                          className="block text-sm font-medium text-gray-300 mb-2"
                        >
                          Target Amount (cUSD)
                        </label>
                        <input
                          id="targetAmount"
                          type="number"
                          min="1"
                          step="0.01"
                          value={targetAmount}
                          onChange={(e) => setTargetAmount(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter target amount in cUSD"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-6">
                        <label
                          htmlFor="location"
                          className="block text-sm font-medium text-gray-300 mb-2"
                        >
                          Campaign Location
                        </label>
                        <input
                          id="location"
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter campaign location"
                          required
                        />
                      </div>

                      <div className="mb-6">
                        <label
                          htmlFor="category"
                          className="block text-sm font-medium text-gray-300 mb-2"
                        >
                          Campaign Category
                        </label>
                        <select
                          id="category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        >
                          <option value="">Select a category</option>
                          <option value="education">Education</option>
                          <option value="housing">Housing</option>
                          <option value="water">Water & Sanitation</option>
                          <option value="healthcare">Healthcare</option>
                          <option value="infrastructure">Infrastructure</option>
                        </select>
                      </div>

                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Campaign Image
                        </label>
                        {imagePreview ? (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Campaign preview"
                              className="w-full h-40 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute top-2 right-2 bg-black bg-opacity-70 rounded-full p-1"
                            >
                              <X className="h-4 w-4 text-white" />
                            </button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 flex flex-col items-center">
                            <Upload className="h-8 w-8 text-gray-500 mb-2" />
                            <p className="text-sm text-gray-400 mb-2">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG or GIF (max. 5MB)
                            </p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4 mb-6 flex items-start">
                    <AlertCircle className="h-5 w-5 text-indigo-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Important Information</p>
                      <p className="text-sm text-gray-400">
                        By creating this campaign, you agree to our terms and conditions. Your
                        campaign will be deployed to the Celo blockchain and will be publicly
                        visible. A small gas fee in cUSD will be charged to deploy your campaign.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => router.push("/")}
                      className="px-6 py-3 bg-gray-800 text-white rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <span className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></span>
                          Creating Campaign...
                        </span>
                      ) : (
                        "Create Campaign"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="bg-gray-800 rounded-full p-6 mb-4">
                  <AlertCircle className="h-10 w-10 text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold mb-2">Connect Your MiniPay Wallet</h2>
                <p className="text-gray-400 text-center max-w-md mb-6">
                  You need to connect your MiniPay wallet to create a new campaign.
                </p>
                <ConnectWalletButton />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden min-h-screen flex flex-col pb-16">
        {/* Header */}
        <div className="px-4 py-3 flex items-center">
          <button className="mr-3" onClick={() => router.push("/")}>
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          <h1 className="text-lg font-bold">Create New Campaign</h1>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-auto p-4">
          {isConnected ? (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-900 text-red-200 p-4 rounded-lg mb-4 flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
              <div className="mb-4">
                <label
                  htmlFor="mobile-title"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Campaign Title
                </label>
                <input
                  id="mobile-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter campaign title"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="mobile-description"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Campaign Description
                </label>
                <textarea
                  id="mobile-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32"
                  placeholder="Describe your campaign in detail"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="mobile-targetAmount"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Target Amount (cUSD)
                </label>
                <input
                  id="mobile-targetAmount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter target amount in cUSD"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="mobile-location"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Campaign Location
                </label>
                <input
                  id="mobile-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter campaign location"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="mobile-category"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Campaign Category
                </label>
                <select
                  id="mobile-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="education">Education</option>
                  <option value="housing">Housing</option>
                  <option value="water">Water & Sanitation</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="infrastructure">Infrastructure</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Campaign Image
                </label>
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Campaign preview"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-black bg-opacity-70 rounded-full p-1"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 flex flex-col items-center relative">
                    <Upload className="h-8 w-8 text-gray-500 mb-2" />
                    <p className="text-sm text-gray-400 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG or GIF (max. 5MB)
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              <div className="bg-gray-900 rounded-lg p-4 mb-6 flex items-start">
                <AlertCircle className="h-5 w-5 text-indigo-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Important Information</p>
                  <p className="text-sm text-gray-400">
                    By creating this campaign, you agree to our terms and conditions. Your
                    campaign will be deployed to the Celo blockchain and will be publicly
                    visible. A small gas fee in cUSD will be charged to deploy your campaign.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg disabled:opacity-70 mb-4"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></span>
                    Creating Campaign...
                  </span>
                ) : (
                  "Create Campaign"
                )}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="bg-gray-800 rounded-full p-6 mb-4">
                <AlertCircle className="h-10 w-10 text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold mb-2">Connect Your MiniPay Wallet</h2>
              <p className="text-gray-400 text-center mb-6">
                You need to connect your MiniPay wallet to create a new campaign.
              </p>
              <ConnectWalletButton />
            </div>
          )}
        </div>

        {/* Bottom navigation */}
        <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}