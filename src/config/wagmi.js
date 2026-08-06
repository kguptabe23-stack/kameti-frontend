import { createConfig, http } from "wagmi";
import { defineChain } from "viem";
import { injected, coinbaseWallet } from "wagmi/connectors";

export const polygonAmoy = defineChain({
  id: 80002,
  name: "Polygon Amoy Testnet",
  nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://polygon-amoy.g.alchemy.com/v2/vw5iec79TUZfR0LwvA2JU"],
    },
  },
  blockExplorers: {
    default: { name: "PolygonScan", url: "https://amoy.polygonscan.com" },
  },
  testnet: true,
});

export const wagmiConfig = createConfig({
  chains: [polygonAmoy],
  connectors: [
    injected(),
    coinbaseWallet({ appName: "Kameti" }),
  ],
  transports: {
    [polygonAmoy.id]: http("https://polygon-amoy.g.alchemy.com/v2/vw5iec79TUZfR0LwvA2JU"),
  },
});