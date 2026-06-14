import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import PlaceOrder from '../components/PlaceOrder';
import { getAuthToken } from '../lib/auth';
import { getPrivateBalance, buildDepositTx, buildWithdrawTx } from '../lib/paymentsApi';
import { baseConnection, erConnection } from '../lib/connections';
import { VersionedTransaction, Transaction } from '@solana/web3.js';

const USDC_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

export default function Dashboard() {
  const wallet = useWallet();
  const [currentView, setCurrentView] = useState<'orderbook' | 'myorders' | 'history' | 'portfolio' | 'settings'>('orderbook');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [modalAmount, setModalAmount] = useState('500');
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  
  const [authToken, setAuthToken] = useState('');
  const [privateBalance, setPrivateBalance] = useState(0);
  const [solBalance, setSolBalance] = useState(0);
  const [trades, setTrades] = useState<any[]>([]);
  const [isTransferring, setIsTransferring] = useState(false);

  const handleTransfer = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) return;
    setIsTransferring(true);
    try {
      const amountBaseUnits = Number(modalAmount) * 1_000_000; // USDC has 6 decimals
      let res;
      if (modalTab === 'deposit') {
        res = await buildDepositTx({
          owner: wallet.publicKey.toBase58(),
          mint: USDC_MINT,
          amount: amountBaseUnits
        });
      } else {
        // For withdraw, we need auth token
        let token = authToken;
        if (!token) {
          try {
            token = await getAuthToken(wallet as any);
            setAuthToken(token);
            sessionStorage.setItem('auth_token', token);
          } catch (authErr) {
            showToast('Error: Wallet signature rejected');
            setIsTransferring(false);
            return;
          }
        }
        res = await buildWithdrawTx({
          owner: wallet.publicKey.toBase58(),
          mint: USDC_MINT,
          amount: amountBaseUnits,
          token
        });
      }

      if (!res || !res.transactionBase64) {
        showToast('Error: API returned no transaction');
        setIsTransferring(false);
        return;
      }

      const txBytes = Uint8Array.from(atob(res.transactionBase64), c => c.charCodeAt(0));
      let tx;
      try {
        tx = VersionedTransaction.deserialize(txBytes);
      } catch (e) {
        tx = Transaction.from(txBytes);
      }

      const conn = res.sendTo === 'ephemeral' ? erConnection : baseConnection;
      await wallet.sendTransaction(tx as any, conn);
      
      showToast(`${modalTab === 'deposit' ? 'Deposit' : 'Withdrawal'} transaction sent!`);
      setIsModalOpen(false);

      // Refresh balances after 3s
      setTimeout(() => {
        if (wallet.publicKey) {
          baseConnection.getBalance(wallet.publicKey).then(b => setSolBalance(b / 1e9)).catch(console.error);
          if (authToken) {
            getPrivateBalance(wallet.publicKey.toBase58(), USDC_MINT, authToken)
              .then(b => setPrivateBalance(b))
              .catch(console.error);
          }
        }
      }, 3000);
      
    } catch (e: any) {
      console.error(e);
      showToast(`Error: ${e.message}`);
    } finally {
      setIsTransferring(false);
    }
  };


  useEffect(() => {
    // Only fetch SOL balance on connect — auth is triggered on demand (deposit/withdraw)
    if (sessionStorage.getItem('auth_token')) {
      setAuthToken(sessionStorage.getItem('auth_token')!);
    }
    if (wallet.publicKey) {
      baseConnection.getBalance(wallet.publicKey).then(b => setSolBalance(b / 1e9)).catch(console.error);
    }
  }, [wallet.publicKey]);

  useEffect(() => {
    if (!wallet.publicKey || !authToken) return;
    const fetchBal = () => {
      getPrivateBalance(wallet.publicKey!.toBase58(), USDC_MINT, authToken)
        .then(b => setPrivateBalance(b))
        .catch(console.error);
    };
    fetchBal();
    const interval = setInterval(fetchBal, 5000);
    return () => clearInterval(interval);
  }, [wallet.publicKey, authToken]);


  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3200);
  };

  return (
    <div id="dashboard" className="page active" style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface)', minHeight: '100vh' }}>
      
      {/* Top nav */}
      <nav className="nav" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="nav-logo">
          <div className="logo-mark">G</div>
          Ghost Book
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="badge badge-green" style={{ fontSize: '11px' }}><span className="live-dot"></span>Devnet live</div>
          <WalletMultiButton />
        </div>
      </nav>

      <div className="db-wrap" style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Sidebar */}
        <aside className="sidebar">

          <div className="sb-section">Trading</div>
          <div className={`sb-item ${currentView === 'orderbook' ? 'active' : ''}`} onClick={() => setCurrentView('orderbook')}><i className="ti ti-chart-candle"></i>Order book</div>
          <div className={`sb-item ${currentView === 'myorders' ? 'active' : ''}`} onClick={() => setCurrentView('myorders')}><i className="ti ti-list-check"></i>My orders</div>
          <div className={`sb-item ${currentView === 'history' ? 'active' : ''}`} onClick={() => setCurrentView('history')}><i className="ti ti-history"></i>Trade history</div>

          <div className="sb-section">Account</div>
          <div className={`sb-item ${currentView === 'portfolio' ? 'active' : ''}`} onClick={() => setCurrentView('portfolio')}><i className="ti ti-wallet"></i>Portfolio</div>
          <div className="sb-item" onClick={() => setIsModalOpen(true)}><i className="ti ti-arrows-exchange"></i>Deposit / Withdraw</div>

          <div className="sb-section">Settings</div>
          <div className={`sb-item ${currentView === 'settings' ? 'active' : ''}`} onClick={() => setCurrentView('settings')}><i className="ti ti-settings"></i>Preferences</div>

          <div className="sb-bottom">
            <div className="tee-badge">
              <div className="tee-badge-title"><i className="ti ti-shield-check"></i> Privacy active</div>
              <div className="tee-badge-sub">TEE verified · Intel TDX</div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="db-main">
          {currentView === 'orderbook' && (
            <div id="view-orderbook">
              {/* Header */}
              <div className="db-header">
                <div className="market-info">
                  <div className="market-name">SOL / USDC</div>
                  <div className="market-price">$142.38</div>
                  <div className="market-change up"><i className="ti ti-trending-up"></i>+2.41%</div>
                  <div className="badge badge-gray" style={{ fontSize: '11px' }}>24h vol $1.24M</div>
                </div>
                <div className="db-header-right">
                  <select className="market-select">
                    <option>SOL / USDC</option>
                    <option>BTC / USDC</option>
                    <option>ETH / USDC</option>
                  </select>
                  <button className="btn-icon"><i className="ti ti-refresh"></i></button>
                </div>
              </div>

              {/* Metrics */}
              <div className="metrics">
                <div className="metric">
                  <div className="metric-lbl">Private balance</div>
                  <div className="metric-val">${privateBalance > 0 ? (Number(privateBalance) / 1_000_000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</div>
                  <div className="metric-sub neutral"><i className="ti ti-shield-lock" style={{ fontSize: '11px' }}></i>USDC in PER</div>
                </div>
                <div className="metric">
                  <div className="metric-lbl">Open orders</div>
                  <div className="metric-val">0</div>
                  <div className="metric-sub neutral"><i className="ti ti-eye-off" style={{ fontSize: '11px' }}></i>Encrypted in TEE</div>
                </div>
                <div className="metric">
                  <div className="metric-lbl">24h volume</div>
                  <div className="metric-val">$0</div>
                  <div className="metric-sub neutral"><i className="ti ti-minus" style={{ fontSize: '11px' }}></i>No data</div>
                </div>
                <div className="metric">
                  <div className="metric-lbl">Unrealised PnL</div>
                  <div className="metric-val">$0.00</div>
                  <div className="metric-sub neutral"><i className="ti ti-minus" style={{ fontSize: '11px' }}></i>No data</div>
                </div>
              </div>

              {/* Chart */}
              <div className="chart-card">
                <div className="chart-header">
                  <div className="chart-header-left">SOL / USDC — Price chart</div>
                  <div className="chart-tabs">
                    <div className="chart-tab">1H</div>
                    <div className="chart-tab active">1D</div>
                    <div className="chart-tab">1W</div>
                  </div>
                </div>
                <svg className="chart-svg" viewBox="0 0 800 80" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#534AB7" stopOpacity="0.12"/>
                      <stop offset="100%" stopColor="#534AB7" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <polygon fill="url(#chartGrad)" points="0,72 80,65 160,60 230,68 300,50 370,38 440,42 510,28 580,20 650,26 720,14 800,10 800,80 0,80"/>
                  <polyline fill="none" stroke="#534AB7" strokeWidth="1.5" strokeLinejoin="round" points="0,72 80,65 160,60 230,68 300,50 370,38 440,42 510,28 580,20 650,26 720,14 800,10"/>
                  <circle cx="800" cy="10" r="3" fill="#534AB7"/>
                </svg>
              </div>

              {/* Order book + Place order */}
              <div className="db-grid-2">
                <div className="card card-pad">
                  <div className="card-title">Order book <span><i className="ti ti-eye-off"></i> All orders encrypted in TEE</span></div>
                  <div className="ob-table">
                    <div className="ob-thead">
                      <span>Price (USDC)</span>
                      <span style={{ textAlign: 'right' }}>Size (SOL)</span>
                      <span>Total</span>
                    </div>
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                      <i className="ti ti-eye-off" style={{ display: 'block', fontSize: '24px', marginBottom: '8px', opacity: 0.5 }}></i>
                      Order book is fully private.<br/>No public data visible.
                    </div>
                  </div>
                </div>

                <PlaceOrder />
              </div>

              {/* Trades + Positions */}
              <div className="db-grid-2">
                {/* Recent trades */}
                <div className="card card-pad">
                  <div className="card-title">Recent trades <span><span className="live-dot"></span>Live</span></div>
                  <div className="trades-thead">
                    <span>Price (USDC)</span><span>Size (SOL)</span><span style={{ textAlign: 'right' }}>Time</span>
                  </div>
                  <div id="trades-list">
                    {trades.length > 0 ? trades.map(t => (
                      <div key={t.id} className="trade-row" style={{ animation: 'fadeIn .3s ease both' }}>
                        <span className={`trade-price ${t.isBuy ? 'buy' : 'sell'}`}>{t.price}</span>
                        <span className="trade-size">{t.size}</span>
                        <div className="trade-time-wrap">
                          <span className="trade-time">{t.time}</span>
                          <span className="ghost-tag"><i className="ti ti-eye-off" style={{ fontSize: '9px' }}></i>ghost</span>
                        </div>
                      </div>
                    )) : (
                      <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                        No recent trades
                      </div>
                    )}
                  </div>
                </div>

                {/* Positions */}
                <div className="card card-pad">
                  <div className="card-title">Open positions <span>0 active</span></div>
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                    No open positions
                  </div>
                </div>
              </div>

              {/* Activity feed */}
              <div className="card card-pad">
                <div className="card-title">Activity feed</div>
                <div className="act-tabs">
                  <div className="act-tab active">All</div>
                  <div className="act-tab">Matches</div>
                </div>
                <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                  No recent activity
                </div>
              </div>
            </div>
          )}

          {currentView === 'myorders' && (
            <div id="view-myorders">
              <div className="db-header"><h2 style={{ fontSize: '16px', fontWeight: 600 }}>My open orders</h2><div className="badge badge-purple"><i className="ti ti-eye-off"></i> All encrypted in TEE</div></div>
              <div className="card card-pad">
                <div className="orders-thead">
                  <span>Side</span><span>Pair</span><span>Price</span><span>Size</span><span>Filled</span><span>Action</span>
                </div>
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                  You have no open orders
                </div>
              </div>
              <div style={{ marginTop: '10px' }} className="privacy-tag"><i className="ti ti-shield-lock"></i>These orders exist as encrypted ephemeral accounts in the TEE. They are invisible to validators, searchers, and block explorers.</div>
            </div>
          )}

          {currentView === 'history' && (
            <div id="view-history">
              <div className="db-header"><h2 style={{ fontSize: '16px', fontWeight: 600 }}>Trade history</h2></div>
              <div className="card card-pad">
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>No recent trade history available.</div>
              </div>
            </div>
          )}

          {currentView === 'portfolio' && (
            <div id="view-portfolio">
              <div className="db-header"><h2 style={{ fontSize: '16px', fontWeight: 600 }}>Portfolio</h2></div>
              <div className="card card-pad">
                <div className="pos-row" style={{ padding: '20px' }}>
                  <div className="pos-left">
                    <div className="pos-sym">SOL (Base Layer)</div>
                    <div className="pos-meta">Public wallet balance</div>
                  </div>
                  <div className="pos-right">
                    <div className="pos-val" style={{ fontSize: '16px', fontWeight: 600 }}>{solBalance.toFixed(4)} SOL</div>
                  </div>
                </div>
                <div className="pos-row" style={{ padding: '20px', borderTop: '0.5px solid var(--border-light)' }}>
                  <div className="pos-left">
                    <div className="pos-sym">USDC (Encrypted TEE)</div>
                    <div className="pos-meta">Private Ephemeral Rollup Balance</div>
                  </div>
                  <div className="pos-right">
                    <div className="pos-val" style={{ fontSize: '16px', fontWeight: 600 }}>{privateBalance} USDC</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'settings' && (
            <div id="view-settings">
              <div className="db-header"><h2 style={{ fontSize: '16px', fontWeight: 600 }}>Preferences</h2></div>
              <div className="card card-pad" style={{ padding: '20px' }}>
                <div className="form-field">
                  <label>RPC Endpoint (Base)</label>
                  <input className="form-input" disabled value="https://api.devnet.solana.com" />
                </div>
                <div className="form-field">
                  <label>TEE Endpoint (Encrypted)</label>
                  <input className="form-input" disabled value="https://devnet-tee.magicblock.app" />
                </div>
                <div className="form-field">
                  <label>Payments API</label>
                  <input className="form-input" disabled value="https://payments.magicblock.app" />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Deposit Modal */}
      {isModalOpen && (
        <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false) }}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Deposit / Withdraw</div>
              <div className="modal-close" onClick={() => setIsModalOpen(false)}><i className="ti ti-x"></i></div>
            </div>
            <div className="modal-tabs">
              <div className={`modal-tab ${modalTab === 'deposit' ? 'active' : ''}`} onClick={() => setModalTab('deposit')}>Deposit</div>
              <div className={`modal-tab ${modalTab === 'withdraw' ? 'active' : ''}`} onClick={() => setModalTab('withdraw')}>Withdraw</div>
            </div>
            <div className="amount-display">
              <div className="amount-big">{Number(modalAmount).toLocaleString()}</div>
              <div className="amount-usd">USDC · ≈ ${Number(modalAmount).toLocaleString()}.00</div>
            </div>
            <div className="quick-amounts">
              {[100, 500, 1000, 5000].map(amt => (
                <div key={amt} className="quick-amt" onClick={() => setModalAmount(amt.toString())}>${amt}</div>
              ))}
            </div>
            <div className="form-field">
              <label>USDC amount</label>
              <input className="form-input" type="number" value={modalAmount} onChange={(e) => setModalAmount(e.target.value)}/>
            </div>
            <div className="modal-info">
              <i className="ti ti-info-circle"></i>
              {modalTab === 'deposit' ? 'Funds move from your Solana wallet into the Private Ephemeral Rollup via the MagicBlock Payments API. Encrypted and private.' : 'Funds move from the Private Ephemeral Rollup back to your Solana wallet. Signed and sent to the ER RPC.'}
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px' }} onClick={handleTransfer} disabled={isTransferring}>
              <i className={modalTab === 'deposit' ? "ti ti-circle-arrow-down" : "ti ti-circle-arrow-up"}></i> {isTransferring ? 'Processing...' : `Confirm ${modalTab}`}
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`toast ${toastVisible ? 'show' : ''}`}>
        <i className="ti ti-shield-check"></i><span>{toastMessage}</span>
      </div>
    </div>
  );
}
