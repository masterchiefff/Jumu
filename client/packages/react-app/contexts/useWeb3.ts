import { useState, useCallback } from "react";
import StableTokenABI from "./cusd-abi.json";
import MinipayNFTABI from "./minipay-nft.json";
import {
    createPublicClient,
    createWalletClient,
    custom,
    getContract,
    http,
    parseEther,
    stringToHex,
} from "viem";
import { celoAlfajores } from "viem/chains";

const publicClient = createPublicClient({
    chain: celoAlfajores,
    transport: http(),
});

const cUSDTokenAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"; // Testnet
const MINIPAY_NFT_CONTRACT = "0xE8F4699baba6C86DA9729b1B0a1DA1Bd4136eFeF"; // Testnet

export const useWeb3 = () => {
    const [address, setAddress] = useState<string | null>(null);

    const connectWallet = useCallback(async () => {
        if (typeof window !== "undefined" && window.ethereum && window.ethereum.isMiniPay) {
            try {
                const walletClient = createWalletClient({
                    transport: custom(window.ethereum),
                    chain: celoAlfajores,
                });

                // Request account access
                const accounts = await walletClient.request({
                    method: "eth_requestAccounts",
                });

                if (accounts.length > 0) {
                    setAddress(accounts[0]);

                    // Listen for account changes
                    window.ethereum.on("accountsChanged", (newAccounts: string[]) => {
                        setAddress(newAccounts[0] || null);
                    });

                    // Listen for chain changes
                    window.ethereum.on("chainChanged", () => {
                        window.location.reload();
                    });

                    return accounts[0];
                }
                throw new Error("No accounts found");
            } catch (error) {
                console.error("Failed to connect MiniPay wallet:", error);
                throw error;
            }
        }
        throw new Error("MiniPay wallet not detected");
    }, []);

    const getUserAddress = useCallback(async () => {
        if (typeof window !== "undefined" && window.ethereum) {
            try {
                const walletClient = createWalletClient({
                    transport: custom(window.ethereum),
                    chain: celoAlfajores,
                });

                const [address] = await walletClient.getAddresses();
                setAddress(address);
                return address;
            } catch (error) {
                console.error("Failed to get user address:", error);
            }
        }
    }, []);

    const sendCUSD = useCallback(async (to: string, amount: string) => {
        if (typeof window !== "undefined" && window.ethereum) {
            try {
                const walletClient = createWalletClient({
                    transport: custom(window.ethereum),
                    chain: celoAlfajores,
                });

                const [address] = await walletClient.getAddresses();
                const amountInWei = parseEther(amount);

                const tx = await walletClient.writeContract({
                    address: cUSDTokenAddress,
                    abi: StableTokenABI.abi,
                    functionName: "transfer",
                    account: address,
                    args: [to, amountInWei],
                });

                const receipt = await publicClient.waitForTransactionReceipt({
                    hash: tx,
                });

                return receipt;
            } catch (error) {
                console.error("Failed to send cUSD:", error);
                throw error;
            }
        }
    }, []);

    const mintMinipayNFT = useCallback(async () => {
        if (typeof window !== "undefined" && window.ethereum) {
            try {
                const walletClient = createWalletClient({
                    transport: custom(window.ethereum),
                    chain: celoAlfajores,
                });

                const [address] = await walletClient.getAddresses();

                const tx = await walletClient.writeContract({
                    address: MINIPAY_NFT_CONTRACT,
                    abi: MinipayNFTABI.abi,
                    functionName: "safeMint",
                    account: address,
                    args: [
                        address,
                        "https://cdn-production-opera-website.operacdn.com/staticfiles/assets/images/sections/2023/hero-top/products/minipay/minipay__desktop@2x.a17626ddb042.webp",
                    ],
                });

                const receipt = await publicClient.waitForTransactionReceipt({
                    hash: tx,
                });

                return receipt;
            } catch (error) {
                console.error("Failed to mint MiniPay NFT:", error);
                throw error;
            }
        }
    }, []);

    const getNFTs = useCallback(async () => {
        if (typeof window !== "undefined" && window.ethereum) {
            try {
                const walletClient = createWalletClient({
                    transport: custom(window.ethereum),
                    chain: celoAlfajores,
                });

                const minipayNFTContract = getContract({
                    abi: MinipayNFTABI.abi,
                    address: MINIPAY_NFT_CONTRACT,
                    client: publicClient,
                });

                const [address] = await walletClient.getAddresses();
                const nfts: any = await minipayNFTContract.read.getNFTsByAddress([address]);

                const tokenURIs: string[] = [];
                for (let i = 0; i < nfts.length; i++) {
                    const tokenURI: string = (await minipayNFTContract.read.tokenURI([nfts[i]])) as string;
                    tokenURIs.push(tokenURI);
                }
                return tokenURIs;
            } catch (error) {
                console.error("Failed to get NFTs:", error);
                throw error;
            }
        }
        return [];
    }, []);

    const signTransaction = useCallback(async () => {
        if (typeof window !== "undefined" && window.ethereum) {
            try {
                const walletClient = createWalletClient({
                    transport: custom(window.ethereum),
                    chain: celoAlfajores,
                });

                const [address] = await walletClient.getAddresses();

                const res = await walletClient.signMessage({
                    account: address,
                    message: stringToHex("Hello from Celo Composer MiniPay Template!"),
                });

                return res;
            } catch (error) {
                console.error("Failed to sign transaction:", error);
                throw error;
            }
        }
    }, []);

    return {
        address,
        getUserAddress,
        sendCUSD,
        mintMinipayNFT,
        getNFTs,
        signTransaction,
        connectWallet,
    };
};