import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import PlaceOrder from '../components/PlaceOrder';
import { getAuthToken } from '../lib/auth';
import { getPrivateBalance } from '../lib/paymentsApi';

export default function Dashboard({ onBack }: { onBack: () => void }) {
  const wallet = useWallet();
  const [currentView, setCurrentView] = useState<'orderbook' | 'myorders' | 'history' | 'portfolio' | 'settings'>('orderbook');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [modalAmount, setModalAmount] = useState('500');
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  
  const [authToken, setAuthToken] = useState('');
  const [privateBalance, setPrivateBalance] = useState(0);
  const [trades, setTrades] = useState<any[]>([]);

  // Dummy trades generator
  const generateTrade = () => {
    const isBuy = Math.random() > 0.5;
    const price = (142.38 + (Math.random() - 0.5) * 0.4).toFixed(2);
    const size = (Math.random() * 5 + 0.5).toFixed(1);
    const now = new Date();
    const t = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0') + ':' + now.getSeconds().toString().padStart(2, '0');
    return { id: Math.random(), isBuy, price, size, time: t };
  };

  useEffect(() => {
    if (wallet.publicKey && !authToken && !sessionStorage.getItem('auth_token')) {
      getAuthToken(wallet as any).then(token => {
        setAuthToken(token);
        sessionStorage.setItem('auth_token', token);
      }).catch(console.error);
    } else if (sessionStorage.getItem('auth_token')) {
      setAuthToken(sessionStorage.getItem('auth_token')!);
    }
  }, [wallet.publicKey]);

  useEffect(() => {
    const initial = Array(7).fill(0).map(generateTrade);
    setTrades(initial);
    const interval = setInterval(() => {
      setTrades(prev => [generateTrade(), ...prev.slice(0, 6)]);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

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
          {wallet.publicKey ? (
            <div className="wallet-pill"><div className="w-dot"></div>{wallet.publicKey.toBase58().slice(0, 4)}...{wallet.publicKey.toBase58().slice(-4)}</div>
          ) : (
            <div className="wallet-pill">Not connected</div>
          )}
          <button className="btn btn-ghost btn-sm" onClick={onBack}><i className="ti ti-arrow-left"></i> Back</button>
        </div>
      </nav>

      <div className="db-wrap" style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sb-logo"><div className="logo-mark" style={{ width: '22px', height: '22px', fontSize: '11px' }}>G</div>Ghost Book</div>

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
                  <div className="metric-val">${privateBalance > 0 ? privateBalance : '4,820'}</div>
                  <div className="metric-sub neutral"><i className="ti ti-shield-lock" style={{ fontSize: '11px' }}></i>USDC in PER</div>
                </div>
                <div className="metric">
                  <div className="metric-lbl">Open orders</div>
                  <div className="metric-val">3</div>
                  <div className="metric-sub neutral"><i className="ti ti-eye-off" style={{ fontSize: '11px' }}></i>Encrypted in TEE</div>
                </div>
                <div className="metric">
                  <div className="metric-lbl">24h volume</div>
                  <div className="metric-val">$12,450</div>
                  <div className="metric-sub up"><i className="ti ti-arrow-up" style={{ fontSize: '11px' }}></i>+18.3% today</div>
                </div>
                <div className="metric">
                  <div className="metric-lbl">Unrealised PnL</div>
                  <div className="metric-val" style={{ color: 'var(--green)' }}>+$234</div>
                  <div className="metric-sub up"><i className="ti ti-arrow-up" style={{ fontSize: '11px' }}></i>+4.9% return</div>
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
                    {/* Asks */}
                    <div className="ob-row" style={{ borderBottom: '0.5px solid var(--border-light)' }}>
                      <div className="ob-row-bar" style={{ width: '28%', background: 'rgba(217,64,64,.06)' }}></div>
                      <span className="ob-price ask">143.42</span><span className="ob-size">4.2</span><span className="ob-total">600.36</span>
                    </div>
                    <div className="ob-row" style={{ borderBottom: '0.5px solid var(--border-light)' }}>
                      <div className="ob-row-bar" style={{ width: '52%', background: 'rgba(217,64,64,.06)' }}></div>
                      <span className="ob-price ask">143.20</span><span className="ob-size">12.4</span><span className="ob-total">1775.68</span>
                    </div>
                    <div className="ob-spread">Spread <span>0.12</span> · Last <span style={{ color: 'var(--green)' }}>$142.38</span></div>
                    {/* Bids */}
                    <div className="ob-row" style={{ borderBottom: '0.5px solid var(--border-light)' }}>
                      <div className="ob-row-bar" style={{ width: '60%', background: 'rgba(26,155,114,.07)' }}></div>
                      <span className="ob-price bid">142.38</span><span className="ob-size">15.2</span><span className="ob-total">2164.18</span>
                    </div>
                    <div className="ob-row" style={{ borderBottom: '0.5px solid var(--border-light)' }}>
                      <div className="ob-row-bar" style={{ width: '38%', background: 'rgba(26,155,114,.07)' }}></div>
                      <span className="ob-price bid">142.20</span><span className="ob-size">9.6</span><span className="ob-total">1365.12</span>
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
                    {trades.map(t => (
                      <div key={t.id} className="trade-row" style={{ animation: 'fadeIn .3s ease both' }}>
                        <span className={`trade-price ${t.isBuy ? 'buy' : 'sell'}`}>{t.price}</span>
                        <span className="trade-size">{t.size}</span>
                        <div className="trade-time-wrap">
                          <span className="trade-time">{t.time}</span>
                          <span className="ghost-tag"><i className="ti ti-eye-off" style={{ fontSize: '9px' }}></i>ghost</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Positions */}
                <div className="card card-pad">
                  <div className="card-title">Open positions <span>3 active</span></div>
                  <div className="pos-row">
                    <div className="pos-left">
                      <div className="pos-sym">SOL / USDC</div>
                      <div className="pos-meta">Long · 10 SOL · avg $138.20</div>
                    </div>
                    <div className="pos-right">
                      <div className="pos-pnl up">+$41.80</div>
                      <div className="pos-pct up">+3.02%</div>
                    </div>
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
                <div className="act-row"><div className="act-icon match"><i className="ti ti-check"></i></div><div className="act-body"><div className="act-title">Order matched</div><div className="act-desc">Bought 2.1 SOL at $142.38 · settled on Solana mainnet atomically</div></div><div className="act-time">12:44:01</div></div>
                <div className="act-row"><div className="act-icon deposit"><i className="ti ti-circle-arrow-down"></i></div><div className="act-body"><div className="act-title">Deposit confirmed</div><div className="act-desc">500 USDC deposited into Private Ephemeral Rollup · balance updated privately</div></div><div className="act-time">12:30:15</div></div>
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
                <div className="orders-row">
                  <span><span className="badge badge-green">Buy</span></span>
                  <span className="mono" style={{ fontSize: '12.5px' }}>SOL/USDC</span>
                  <span className="mono" style={{ color: 'var(--green)' }}>$142.00</span>
                  <span className="mono">5.0 SOL</span>
                  <span><div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>0%</div></span>
                  <span><button className="cancel-order-btn">Cancel</button></span>
                </div>
              </div>
              <div style={{ marginTop: '10px' }} className="privacy-tag"><i className="ti ti-shield-lock"></i>These orders exist as encrypted ephemeral accounts in the TEE. They are invisible to validators, searchers, and block explorers.</div>
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
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px' }} onClick={() => {
              showToast(modalTab === 'deposit' ? 'Deposit confirmed' : 'Withdrawal confirmed');
              setIsModalOpen(false);
            }}>
              <i className={modalTab === 'deposit' ? "ti ti-circle-arrow-down" : "ti ti-circle-arrow-up"}></i> Confirm {modalTab}
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
