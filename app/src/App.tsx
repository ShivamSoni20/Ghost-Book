// React import removed
import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";

function AppContent() {
  const { connected } = useWallet();
  return connected ? <Dashboard /> : <LandingPage />;
}

export default function App() {
  const endpoint = import.meta.env.VITE_PROVIDER_ENDPOINT || "https://api.devnet.solana.com";
  const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AppContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
