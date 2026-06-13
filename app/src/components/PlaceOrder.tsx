import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getErProgram, getOrderPda, getSponsorPda } from '../lib/program';
import { erConnection } from '../lib/connections';
import * as anchor from '@coral-xyz/anchor';

export default function PlaceOrder() {
  const wallet = useWallet();
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState(142.0);
  const [size, setSize] = useState(1.0);
  const [status, setStatus] = useState<'idle' | 'encrypting' | 'placed'>('idle');

  async function handlePlaceOrder() {
    if (!wallet.publicKey || !wallet.signTransaction) return;
    setStatus('encrypting');
    try {
      const ts = Date.now();
      const [orderPda] = getOrderPda(wallet.publicKey, ts);
      const [sponsorPda] = getSponsorPda(wallet.publicKey);

      // @ts-ignore
      const erProgram = getErProgram(wallet as anchor.Wallet);

      const tx = await erProgram.methods
        .placeOrder(side === 'buy' ? { bid: {} } : { ask: {} }, new anchor.BN(price * 1e6), new anchor.BN(size * 1e9))
        .accounts({
          trader: wallet.publicKey,
          sponsor: sponsorPda,
          authority: wallet.publicKey,
          order: orderPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .transaction();

      tx.feePayer = wallet.publicKey;
      tx.recentBlockhash = (await erConnection.getLatestBlockhash()).blockhash;
      const signed = await wallet.signTransaction(tx);
      await erConnection.sendRawTransaction(signed.serialize(), { skipPreflight: true });

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
