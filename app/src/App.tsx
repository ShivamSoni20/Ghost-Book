import React, { useState } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [page, setPage] = useState<"landing" | "dashboard">("landing");

  const endpoint = import.meta.env.VITE_PROVIDER_ENDPOINT || "https://api.devnet.solana.com";
  const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {page === "landing"
            ? <LandingPage onLaunch={() => setPage("dashboard")} />
            : <Dashboard onBack={() => setPage("landing")} />
          }
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
