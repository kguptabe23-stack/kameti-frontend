import { createConfig, http }   from "wagmi";
import { defineChain }           from "viem";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";

// ── Polygon Amoy Testnet ──────────────────────────────────────────────────────
export const polygonAmoy = defineChain({
    id            : 80002,
    name          : "Polygon Amoy Testnet",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    rpcUrls: {
        default: { http: ["https://rpc-amoy.polygon.technology"] },
    },
    blockExplorers: {
        default: { name: "PolygonScan", url: "https://amoy.polygonscan.com" },
    },
    testnet: true,
});

// ── Wagmi Config — supports MetaMask, WalletConnect, Coinbase, Trust, all injected wallets ──
export const wagmiConfig = createConfig({
    chains    : [polygonAmoy],
    connectors: [
        injected(),                          // MetaMask, Trust Wallet, Bitget, any browser wallet
        coinbaseWallet({ appName: "Kameti" }), // Coinbase Wallet
        walletConnect({
            projectId: "2f3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d", // replace with real ID from cloud.walletconnect.com
        }),
    ],
    transports: {
        [polygonAmoy.id]: http(),
    },
});