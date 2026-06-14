// React import removed
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function LandingPage() {
  return (
    <div id="landing" className="page active">
      {/* Nav */}
      <nav className="nav">
        <div className="nav-logo">
          <div className="logo-mark">G</div>
          Ghost Book
        </div>
        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="https://docs.magicblock.gg" target="_blank" rel="noreferrer">Docs</a>
          <span>Security</span>
        </div>
        <div className="nav-right">
          <WalletMultiButton />
        </div>
      </nav>

      {/* Hero */}
      <section className="hero fade-in">
        <div className="hero-eyebrow">
          <span className="badge badge-purple"><i className="ti ti-shield-lock"></i> Powered by MagicBlock Private ER (TEE)</span>
        </div>
        <h1>Trade with<br/><em>zero visibility</em></h1>
        <p>The first fully private onchain limit order book on Solana. Your orders live as encrypted ephemeral accounts inside a TEE — invisible to validators, searchers, and block explorers until the moment they fill.</p>
        <div className="hero-btns">
          <WalletMultiButton />
          <button className="btn btn-outline btn-lg"><i className="ti ti-book-2"></i> Read the docs</button>
        </div>
        <div className="hero-note"><i className="ti ti-shield-check" style={{color:'var(--green)',fontSize:'13px'}}></i> Non-custodial · Open source · Intel TDX verified</div>
      </section>

      {/* Proof bar */}
      <div className="proof-bar">
        <div className="proof-inner">
          <div className="proof-item">
            <div className="proof-num">$0</div>
            <div className="proof-lbl">MEV extracted from users</div>
          </div>
          <div className="proof-item">
            <div className="proof-num">50ms</div>
            <div className="proof-lbl">Crank matching latency</div>
          </div>
          <div className="proof-item">
            <div className="proof-num">100%</div>
            <div className="proof-lbl">Order privacy until fill</div>
          </div>
        </div>
      </div>

      {/* Features */}
      <section className="features-section" id="features">
        <div className="section-label">Why Ghost Book</div>
        <div className="section-title">Built for traders who value privacy</div>
        <div className="section-sub">Every DEX on Solana has a public mempool. Your order is visible the moment you submit it. Ghost Book changes that.</div>
        <div className="features-grid">
          <div className="feat">
            <div className="feat-icon" style={{background:'var(--purple-light)',color:'var(--purple)'}}><i className="ti ti-eye-off"></i></div>
            <h3>MEV-proof orders</h3>
            <p>Orders are stored as encrypted ephemeral accounts inside the Private Ephemeral Rollup. No one sees your price or size — not validators, not block explorers — until the moment of fill.</p>
          </div>
          <div className="feat">
            <div className="feat-icon" style={{background:'var(--green-light)',color:'var(--green)'}}><i className="ti ti-bolt"></i></div>
            <h3>50ms matching engine</h3>
            <p>A crank-driven matching loop runs every 50ms inside the TEE. Zero gas per match cycle, zero public state. Unmatched orders are cancelled privately — they never appear in any block.</p>
          </div>
          <div className="feat">
            <div className="feat-icon" style={{background:'var(--green-light)',color:'var(--green)'}}><i className="ti ti-transfer"></i></div>
            <h3>Atomic settlement</h3>
            <p>On match, a Magic Action fires atomically on Solana mainnet — SPL tokens settle in a single transaction. No intermediate order state, no trail of partial fills, just a clean settlement.</p>
          </div>
          <div className="feat">
            <div className="feat-icon" style={{background:'var(--amber-light)',color:'var(--amber)'}}><i className="ti ti-building-bank"></i></div>
            <h3>Institutional grade</h3>
            <p>Intel TDX hardware security with fine-grained access control. Session keys eliminate per-tx signing. Private balance reads protected by bearer-token authentication. Compliance-ready.</p>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="comparison-section">
        <div className="comparison-inner">
          <div className="section-label">Ghost Book vs. Existing DEXs</div>
          <div className="section-title">The problem with public mempools</div>
          <div className="comparison-grid">
            <div className="comp-col bad">
              <div className="comp-col-header">
                <div className="comp-col-icon" style={{background:'var(--red-light)',color:'var(--red)'}}><i className="ti ti-world"></i></div>
                <div>
                  <div className="comp-col-title">Every existing DEX</div>
                  <div className="comp-col-subtitle">Public mempool, fully visible</div>
                </div>
              </div>
              <div className="comp-item"><i className="ti ti-x" style={{color:'var(--red)'}}></i>Orders visible on submission</div>
              <div className="comp-item"><i className="ti ti-x" style={{color:'var(--red)'}}></i>MEV bots front-run your trades</div>
              <div className="comp-item"><i className="ti ti-x" style={{color:'var(--red)'}}></i>Sandwich attacks on large orders</div>
              <div className="comp-item"><i className="ti ti-x" style={{color:'var(--red)'}}></i>Price/size leaked to searchers</div>
              <div className="comp-item"><i className="ti ti-x" style={{color:'var(--red)'}}></i>Strategy exposed in real time</div>
            </div>
            <div className="comp-col good">
              <div className="comp-col-header">
                <div className="comp-col-icon" style={{background:'rgba(255,255,255,.15)',color:'#fff'}}><i className="ti ti-ghost"></i></div>
                <div>
                  <div className="comp-col-title">Ghost Book</div>
                  <div className="comp-col-subtitle">TEE-encrypted, zero visibility</div>
                </div>
              </div>
              <div className="comp-item"><i className="ti ti-check" style={{color:'rgba(255,255,255,.7)'}}></i>Orders encrypted at creation</div>
              <div className="comp-item"><i className="ti ti-check" style={{color:'rgba(255,255,255,.7)'}}></i>MEV structurally impossible</div>
              <div className="comp-item"><i className="ti ti-check" style={{color:'rgba(255,255,255,.7)'}}></i>No sandwich — no visible tx</div>
              <div className="comp-item"><i className="ti ti-check" style={{color:'rgba(255,255,255,.7)'}}></i>Price/size hidden until fill</div>
              <div className="comp-item"><i className="ti ti-check" style={{color:'rgba(255,255,255,.7)'}}></i>Clean settlement on mainnet</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-section" id="how">
        <div className="section-label">Flow</div>
        <div className="section-title">How Ghost Book works</div>
        <div className="steps">
          <div className="step">
            <div className="step-bubble"><i className="ti ti-circle-arrow-down" style={{fontSize:'16px'}}></i></div>
            <h4>Deposit</h4>
            <p>SPL tokens move from your Solana wallet into the Private Ephemeral Rollup via the Payments API. Funds are escrowed privately.</p>
          </div>
          <div className="step">
            <div className="step-bubble"><i className="ti ti-lock" style={{fontSize:'16px'}}></i></div>
            <h4>Place private order</h4>
            <p>Your bid or ask is stored as an encrypted ephemeral account inside the TEE. Invisible onchain. Never appears in any block explorer.</p>
          </div>
          <div className="step">
            <div className="step-bubble"><i className="ti ti-refresh" style={{fontSize:'16px'}}></i></div>
            <h4>Crank matches</h4>
            <p>The on-chain crank runs every 50ms inside the secure environment, crossing bids and asks. Zero gas, zero public state per cycle.</p>
          </div>
          <div className="step">
            <div className="step-bubble"><i className="ti ti-check" style={{fontSize:'16px'}}></i></div>
            <h4>Clean settlement</h4>
            <p>On match, a Magic Action fires atomically — SPL tokens settle on Solana mainnet with no trace of intermediate order state.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner">
          <div className="badge badge-purple" style={{marginBottom:'16px'}}><i className="ti ti-ghost"></i> Now live on devnet</div>
          <h2>Start trading invisibly</h2>
          <p>Connect your Solana wallet and place your first private limit order in under 60 seconds. No registration, non-custodial, fully onchain.</p>
          <div className="cta-btns">
            <WalletMultiButton />
            <button className="btn btn-outline btn-lg"><i className="ti ti-brand-github"></i> View on GitHub</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-left">
          <div className="logo-mark" style={{width:'22px',height:'22px',fontSize:'11px'}}>G</div>
          Ghost Book
        </div>
        <div className="footer-right">
          <span>Docs</span>
          <span>GitHub</span>
          <span>MagicBlock</span>
          <span>Built for Solana Blitz v5 · 2025</span>
        </div>
      </footer>
    </div>
  );
}
