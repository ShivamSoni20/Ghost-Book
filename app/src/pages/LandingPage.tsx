import React from 'react';

export default function LandingPage({ onLaunch }: { onLaunch: () => void }) {
  return (
    <div id="landing" className="page active">
      <nav className="nav">
        <div className="nav-logo">
          <div className="logo-mark">G</div>
          Ghost Book
        </div>
        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="https://docs.magicblock.gg" target="_blank">Docs</a>
          <a href="#">Security</a>
        </div>
        <div className="nav-right">
          <button className="btn btn-ghost btn-sm" onClick={onLaunch}>Sign in</button>
          <button className="btn btn-primary btn-sm" onClick={onLaunch}><i className="ti ti-bolt"></i> Launch app</button>
        </div>
      </nav>

      <section className="hero fade-in">
        <div className="hero-eyebrow">
          <span className="badge badge-purple"><i className="ti ti-shield-lock"></i> Powered by MagicBlock Private ER (TEE)</span>
        </div>
        <h1>Trade with<br/><em>zero visibility</em></h1>
        <p>The first fully private onchain limit order book on Solana. Your orders live as encrypted ephemeral accounts inside a TEE — invisible to validators, searchers, and block explorers until the moment they fill.</p>
        <div className="hero-btns">
          <button className="btn btn-primary btn-lg" onClick={onLaunch}>Open trading app <i className="ti ti-arrow-right"></i></button>
          <button className="btn btn-outline btn-lg"><i className="ti ti-book-2"></i> Read the docs</button>
        </div>
        <div className="hero-note"><i className="ti ti-shield-check" style={{color:'var(--green)',fontSize:'13px'}}></i> Non-custodial · Open source · Intel TDX verified</div>
      </section>

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
    </div>
  );
}
