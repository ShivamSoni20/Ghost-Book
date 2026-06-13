import React, { useState } from 'react';
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { getErProgram, getOrderPda, getSponsorPda } from '../lib/program';
import { erConnection } from '../lib/connections';
import * as anchor from '@coral-xyz/anchor';

export default function PlaceOrder() {
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState(142.0);
  const [size, setSize] = useState(1.0);
  const [status, setStatus] = useState<'idle' | 'encrypting' | 'placed'>('idle');

  async function handlePlaceOrder() {
    if (!anchorWallet) return;
    setStatus('encrypting');
    try {
      const erProgram = getErProgram(anchorWallet);
      // Use current time as the order's unique timestamp seed
      const timestamp = Math.floor(Date.now() / 1000); // unix seconds as i64
      const [orderPda] = getOrderPda(anchorWallet.publicKey, timestamp);
      const [sponsorPda] = getSponsorPda(anchorWallet.publicKey);

      const tx = await erProgram.methods
        .placeOrder(
          side === 'buy' ? { bid: {} } : { ask: {} },
          new anchor.BN(Math.round(price * 1_000_000)),    // 6-decimal USDC price
          new anchor.BN(Math.round(size  * 1_000_000_000)), // 9-decimal SOL size
          new anchor.BN(timestamp)                          // i64 timestamp for seed
        )
        .accounts({
          trader:        anchorWallet.publicKey,
          sponsor:       sponsorPda,
          authority:     anchorWallet.publicKey,
          order:         orderPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .transaction();

      tx.feePayer = anchorWallet.publicKey;
      const { blockhash } = await erConnection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;

      const signed = await anchorWallet.signTransaction(tx);
      await erConnection.sendRawTransaction(signed.serialize(), {
        skipPreflight: true,
      });

      setStatus('placed');
    } catch (e) {
      console.error(e);
      setStatus('idle');
    }
    setTimeout(() => setStatus('idle'), 2000);
  }

  return (
    <div className="card card-pad">
      <div className="order-seg">
        <div className={`seg-opt ${side === 'buy' ? 'buy-active' : ''}`} onClick={() => setSide('buy')}>Buy</div>
        <div className={`seg-opt ${side === 'sell' ? 'sell-active' : ''}`} onClick={() => setSide('sell')}>Sell</div>
      </div>
      <div className="form-field">
        <label>Price (USDC)</label>
        <input type="number" className="form-input" value={price} onChange={e => setPrice(Number(e.target.value))} />
      </div>
      <div className="form-field">
        <label>Size (SOL)</label>
        <input type="number" className="form-input" value={size} onChange={e => setSize(Number(e.target.value))} />
      </div>
      <div className="form-field">
        <label>Total (USDC)</label>
        <input type="number" className="form-input readonly" value={price * size} readOnly />
      </div>
      <div className="privacy-tag" style={{ marginBottom: 12 }}>
        <i className="ti ti-eye-off"></i> Order encrypted in TEE — invisible until filled
      </div>
      <button 
        className={`submit-btn ${side}`} 
        onClick={handlePlaceOrder}
        disabled={!wallet.publicKey || status !== 'idle'}
      >
        {status === 'encrypting' ? 'Encrypting in TEE...' : status === 'placed' ? 'Order Placed' : `Place ${side === 'buy' ? 'Bid' : 'Ask'}`}
      </button>
    </div>
  );
}
