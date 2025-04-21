import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import Web3 from "web3"

export const weiToCUSD = (wei: string | number) => {
  const weiStr = typeof wei === "number" ? wei.toString() : wei
  return Number.parseFloat(Web3.utils.fromWei(weiStr, "ether")).toFixed(2)
}

export const truncateAddress = (address: string) => {
  return address.slice(0, 6) + "..." + address.slice(-4)
}

export const formatCurrency = (amount: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(Number(amount))
}

export const calculateProgress = (current: string | number, target: string | number) => {
  const currentStr = typeof current === "number" ? current.toString() : current
  const targetStr = typeof target === "number" ? target.toString() : target

  const currentValue = Number.parseFloat(Web3.utils.fromWei(currentStr, "ether"))
  const targetValue = Number.parseFloat(Web3.utils.fromWei(targetStr, "ether"))
  return Math.min(Math.round((currentValue / targetValue) * 100), 100)
}

export const getProgressColor = (percentage: number) => {
  if (percentage < 80) return "bg-indigo-500"
  if (percentage < 100) return "bg-amber-500"
  return "bg-green-500"
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
