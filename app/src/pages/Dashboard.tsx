import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import PlaceOrder from '../components/PlaceOrder';
import { getAuthToken, getPrivateBalance } from '../lib/paymentsApi';
import * as anchor from '@coral-xyz/anchor';

export default function Dashboard({ onBack }: { onBack: () => void }) {
  const wallet = useWallet();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    /*
    // Auth flow on mount
    if (wallet.publicKey && wallet.signMessage) {
      getAuthToken(wallet as anchor.Wallet).then(token => {
        getPrivateBalance(wallet.publicKey!.toBase58(), "USDC_MINT", token).then(bal => {
          setBalance(bal);
        });
      }).catch(console.error);
    }
    */
  }, [wallet.publicKey]);

  return (
    <div id="dashboard" className="page active">
      <nav className="nav" style={{position:'sticky', top:0, zIndex:100}}>
        <div className="nav-logo">
          <div className="logo-mark">G</div>
          Ghost Book
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <div className="badge badge-green" style={{fontSize:'11px'}}><span className="live-dot"></span>Devnet live</div>
          <div className="wallet-pill"><div className="w-dot"></div>{wallet.publicKey ? wallet.publicKey.toBase58().slice(0,4) + '...' : 'Not Connected'}</div>
          <button className="btn btn-ghost btn-sm" onClick={onBack}><i className="ti ti-arrow-left"></i> Back</button>
        </div>
      </nav>
      <div className="db-wrap">
        <aside className="sidebar">
          <div className="sb-section">Trading</div>
          <div className="sb-item active"><i className="ti ti-chart-candle"></i>Order book</div>
          <div className="sb-bottom" style={{marginTop: 'auto'}}>
            <div className="tee-badge">
              <div className="tee-badge-title"><i className="ti ti-shield-check"></i> Privacy active</div>
              <div className="tee-badge-sub">TEE verified · Intel TDX</div>
            </div>
          </div>
        </aside>
        <main className="db-main">
          <div className="db-header">
            <div className="market-info">
              <div className="market-name">SOL / USDC</div>
              <div className="market-price">$142.38</div>
            </div>
          </div>
          <div className="metrics">
            <div className="metric">
              <div className="metric-lbl">Private balance</div>
              <div className="metric-val">${balance}</div>
            </div>
            {/* other metrics */}
          </div>
          <div className="db-grid-2">
            <div className="card card-pad">
              <div className="card-title">Order book <span><i className="ti ti-eye-off"></i> All orders encrypted in TEE</span></div>
              <div className="ob-table">
                <div className="ob-thead">
                  <span>Price (USDC)</span>
                  <span style={{textAlign:'right'}}>Size (SOL)</span>
                  <span style={{textAlign:'right'}}>Total</span>
                </div>
                {/* Dummy rows */}
              </div>
            </div>
            <PlaceOrder />
          </div>
        </main>
      </div>
    </div>
  );
}
