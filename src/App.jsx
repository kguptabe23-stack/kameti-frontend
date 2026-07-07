// ─────────────────────────────────────────────────────────────────────────────
// KAMETI BLOCKCHAIN APP — FIXED VERSION
// All hooks called at top level (React rules)
// All wallets supported via wagmi connectors
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import {
  useAccount, useConnect, useDisconnect,
  useReadContract, useWriteContract,
  useWaitForTransactionReceipt, useBalance,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import {
  Wallet, Users, Plus, TrendingUp, ChevronRight,
  CheckCircle, Clock, AlertCircle, Award, ArrowLeft,
  Copy, ExternalLink, Shield, Zap, BarChart2, LogOut, Loader,
} from "lucide-react";
import { ADDRESSES, FACTORY_ABI, POOL_ABI, TOKEN_ABI } from "./config/contracts.js";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const GOLD       = "#D4A017";
const GOLD_LIGHT = "#F0C040";
const NAVY       = "#0D1B2A";

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; }
  .app { display: flex; min-height: 100vh; background: #f5f4f0; }
  .sidebar { width: 240px; background: #0D1B2A; display: flex; flex-direction: column; flex-shrink: 0; }
  .sidebar-logo { padding: 28px 24px 20px; border-bottom: 0.5px solid rgba(255,255,255,0.08); }
  .logo-text { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
  .logo-sub { font-size: 10px; color: #D4A017; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px; }
  .nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; cursor: pointer; color: rgba(255,255,255,0.5); font-size: 14px; transition: all 0.15s; border: none; background: none; width: 100%; text-align: left; font-family: 'DM Sans', sans-serif; }
  .nav-item:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.85); }
  .nav-item.active { background: rgba(212,160,23,0.15); color: #D4A017; font-weight: 500; }
  .nav-item svg { width: 16px; height: 16px; flex-shrink: 0; }
  .nav-section { font-size: 10px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.2); padding: 16px 12px 6px; }
  .sidebar-wallet { padding: 16px 12px 24px; border-top: 0.5px solid rgba(255,255,255,0.08); }
  .wallet-box { background: rgba(255,255,255,0.05); border-radius: 10px; padding: 12px; border: 0.5px solid rgba(255,255,255,0.08); }
  .wallet-label { font-size: 10px; color: rgba(255,255,255,0.3); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
  .wallet-addr { font-size: 12px; color: rgba(255,255,255,0.7); font-family: monospace; }
  .wallet-bal { font-size: 13px; color: #D4A017; font-weight: 500; margin-top: 6px; }
  .main { flex: 1; overflow: auto; background: #f5f4f0; }
  .page { padding: 32px; max-width: 900px; }
  .page-header { margin-bottom: 28px; }
  .page-title { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.5px; }
  .page-sub { font-size: 14px; color: #666; margin-top: 4px; }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
  .stat-card { background: #fff; border: 0.5px solid #e8e6e0; border-radius: 12px; padding: 16px 18px; }
  .stat-label { font-size: 11px; color: #888; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 8px; }
  .stat-value { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; color: #1a1a1a; }
  .stat-sub { font-size: 11px; color: #888; margin-top: 4px; }
  .stat-accent { color: #D4A017; }
  .pool-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .pool-card { background: #fff; border: 0.5px solid #e8e6e0; border-radius: 14px; padding: 20px; cursor: pointer; transition: all 0.15s; position: relative; overflow: hidden; }
  .pool-card:hover { border-color: #ccc; }
  .pool-card-accent { position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 14px 14px 0 0; }
  .pool-name { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 600; color: #1a1a1a; margin-bottom: 4px; }
  .pool-amount { font-size: 24px; font-weight: 500; color: #1a1a1a; font-family: 'Syne', sans-serif; }
  .pool-amount-label { font-size: 11px; color: #888; }
  .pool-meta { display: flex; gap: 16px; margin-top: 14px; padding-top: 14px; border-top: 0.5px solid #f0ede6; }
  .pool-meta-item { font-size: 12px; color: #888; display: flex; align-items: center; gap: 4px; }
  .pool-meta-item svg { width: 12px; height: 12px; }
  .progress-bar { height: 4px; background: #f0ede6; border-radius: 99px; margin-top: 12px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 99px; background: #D4A017; }
  .badge { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 500; padding: 3px 8px; border-radius: 99px; }
  .badge-open { background: #EAF3DE; color: #3B6D11; }
  .badge-active { background: #FFF3D6; color: #855000; }
  .badge-completed { background: #E6F1FB; color: #0C447C; }
  .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; border: 0.5px solid #d0cdc6; background: #fff; color: #1a1a1a; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
  .btn:hover { background: #f5f4f0; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-primary { background: #0D1B2A; color: #fff; border-color: #0D1B2A; }
  .btn-primary:hover { background: #1a2f45; }
  .btn-gold { background: #D4A017; color: #fff; border-color: #D4A017; }
  .btn-gold:hover { background: #E8B020; }
  .btn-outline { background: transparent; color: #1a1a1a; border: 0.5px solid #d0cdc6; }
  .btn svg { width: 15px; height: 15px; }
  .card { background: #fff; border: 0.5px solid #e8e6e0; border-radius: 14px; padding: 24px; }
  .form-group { margin-bottom: 18px; }
  .form-label { font-size: 13px; font-weight: 500; color: #1a1a1a; margin-bottom: 6px; display: block; }
  .form-hint { font-size: 11px; color: #888; margin-top: 4px; }
  .form-input { width: 100%; padding: 10px 14px; border-radius: 8px; border: 0.5px solid #d0cdc6; background: #fff; color: #1a1a1a; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; }
  .form-input:focus { border-color: #D4A017; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .yield-banner { background: #0D1B2A; border-radius: 12px; padding: 18px; margin-bottom: 20px; display: flex; align-items: center; gap: 14px; }
  .yield-icon { width: 38px; height: 38px; border-radius: 8px; background: rgba(212,160,23,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .yield-title { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; color: #fff; }
  .yield-sub { font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 2px; }
  .yield-amount { margin-left: auto; font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; color: #D4A017; }
  .info-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 0.5px solid #f0ede6; font-size: 14px; }
  .info-row:last-child { border-bottom: none; }
  .info-key { color: #666; }
  .info-val { color: #1a1a1a; font-weight: 500; }
  .member-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 0.5px solid #f0ede6; }
  .member-row:last-child { border-bottom: none; }
  .avatar { width: 34px; height: 34px; border-radius: 50%; background: #0D1B2A; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: #D4A017; flex-shrink: 0; }
  .tab-bar { display: flex; gap: 4px; margin-bottom: 20px; background: #f0ede6; padding: 4px; border-radius: 10px; width: fit-content; }
  .tab { padding: 7px 16px; border-radius: 8px; font-size: 13px; cursor: pointer; border: none; background: none; color: #888; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
  .tab.active { background: #fff; color: #1a1a1a; font-weight: 500; border: 0.5px solid #e0ddd5; }
  .back-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: #666; cursor: pointer; border: none; background: none; padding: 0; margin-bottom: 20px; font-family: 'DM Sans', sans-serif; }
  .back-btn:hover { color: #1a1a1a; }
  .empty-state { text-align: center; padding: 48px 24px; color: #888; }
  .empty-icon { margin: 0 auto 14px; width: 44px; height: 44px; border-radius: 10px; background: #f0ede6; display: flex; align-items: center; justify-content: center; }
  .notif { position: fixed; top: 20px; right: 20px; background: #fff; border: 0.5px solid #e0ddd5; border-radius: 10px; padding: 12px 16px; font-size: 13px; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); z-index: 999; animation: slideIn 0.2s ease; }
  @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  .connect-screen { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f5f4f0; }
  .connect-card { background: #fff; border: 0.5px solid #e8e6e0; border-radius: 20px; padding: 48px 40px; text-align: center; max-width: 420px; width: 100%; }
  .connect-logo { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; color: #0D1B2A; }
  .connect-chain { font-size: 11px; color: #D4A017; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px; margin-bottom: 28px; }
  .wallet-option { display: flex; align-items: center; gap: 12px; padding: 13px 16px; border-radius: 10px; border: 0.5px solid #e0ddd5; background: #fff; cursor: pointer; width: 100%; font-size: 14px; font-weight: 500; color: #1a1a1a; font-family: 'DM Sans', sans-serif; transition: all 0.15s; margin-bottom: 10px; }
  .wallet-option:hover { background: #f5f4f0; border-color: #ccc; }
  .wallet-option:disabled { opacity: 0.5; cursor: not-allowed; }
  .wallet-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .tx-pending { background: #FFF3D6; border: 0.5px solid #F0B429; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #855000; display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
  .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
  .section-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 600; color: #1a1a1a; }
  .loading { display: flex; align-items: center; gap: 8px; color: #888; font-size: 13px; padding: 20px; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const fmtUSDC   = (n) => `₹${Number(formatUnits(n || 0n, 6)).toLocaleString("en-IN")}`;
const fmtINR    = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const shortAddr = (a) => a ? `${a.slice(0, 6)}...${a.slice(-4)}` : "";
const initials  = (a) => a ? a.slice(2, 4).toUpperCase() : "??";
const STATUS_MAP = { 0: "Open", 1: "Active", 2: "Completed", 3: "Paused" };

const statusBadge = (s) => {
  const num   = Number(s);
  const label = STATUS_MAP[num] || "Unknown";
  const cls   = { 0: "badge-open", 1: "badge-active", 2: "badge-completed", 3: "badge-active" };
  const icons = { 0: <Clock size={10}/>, 1: <Zap size={10}/>, 2: <CheckCircle size={10}/>, 3: <AlertCircle size={10}/> };
  return <span className={`badge ${cls[num]}`}>{icons[num]} {label}</span>;
};

// ─────────────────────────────────────────────────────────────────────────────
// POOL CARD — reads its own data from chain
// ─────────────────────────────────────────────────────────────────────────────
// Add this helper just above PoolCard
const parseConfig = (c) => {
  if (!c) return null;
  return {
    monthlyAmount     : c[0] ?? c.monthlyAmount       ?? 0n,
    maxMembers        : c[1] ?? c.maxMembers           ?? 0n,
    collateralBps     : c[2] ?? c.collateralBps        ?? 0n,
    contributionWindow: c[3] ?? c.contributionWindow   ?? 0n,
    platformFeeBps    : c[4] ?? c.platformFeeBps       ?? 0n,
  };
};

function PoolCard({ poolAddress, onSelect, myAddress }) {
  const SC = { 0: "#639922", 1: "#BA7517", 2: "#185FA5" };

  const { data: info }      = useReadContract({ address: poolAddress, abi: POOL_ABI, functionName: "getPoolInfo", watch: true });
  const { data: configRaw } = useReadContract({ address: poolAddress, abi: POOL_ABI, functionName: "config" });
  const { data: myMember }  = useReadContract({ address: poolAddress, abi: POOL_ABI, functionName: "getMemberInfo", args: [myAddress], enabled: !!myAddress });

  const config = parseConfig(configRaw);

  if (!info || !config) return (
    <div className="pool-card">
      <div className="loading"><Loader size={14}/> Loading pool...</div>
    </div>
  );

  const [memberCount, round, status] = info;
  const sNum = Number(status);
  const max  = Number(config.maxMembers);
  const prog = max > 0 ? (sNum === 1 ? Number(round) / max : Number(memberCount) / max) : 0;

  return (
    <div className="pool-card" onClick={() => onSelect(poolAddress)}>
      <div className="pool-card-accent" style={{ background: SC[sNum] || "#888" }}/>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div className="pool-name" style={{ fontSize: 13, fontFamily: "monospace", fontWeight: 400 }}>{shortAddr(poolAddress)}</div>
        {statusBadge(status)}
      </div>
      <div className="pool-amount-label">Monthly contribution</div>
      <div className="pool-amount">{fmtUSDC(config.monthlyAmount)}</div>
      <div className="pool-meta">
        <div className="pool-meta-item"><Users/>{Number(memberCount)}/{max}</div>
        {sNum === 1 && <div className="pool-meta-item"><Zap/>Rd {Number(round)}/{max}</div>}
        {sNum === 0 && <div className="pool-meta-item"><Clock/>{max - Number(memberCount)} left</div>}
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${prog * 100}%` }}/>
      </div>
      {myMember?.isActive && (
        <div style={{ marginTop: 8, fontSize: 11, color: "#D4A017", fontWeight: 600 }}>✓ You are a member</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// POOL DETAIL
// ─────────────────────────────────────────────────────────────────────────────
function PoolDetail({ poolAddress, myAddress, onBack, toast }) {
  const [tab, setTab] = useState("info");

  const { data: info,     refetch: ri } = useReadContract({ address: poolAddress, abi: POOL_ABI, functionName: "getPoolInfo", watch: true });
  const { data: configRaw } = useReadContract({ address: poolAddress, abi: POOL_ABI, functionName: "config" });
  const config = parseConfig(configRaw);
  const { data: myMember, refetch: rm } = useReadContract({ address: poolAddress, abi: POOL_ABI, functionName: "getMemberInfo", args: [myAddress] });
  const { data: spots }                 = useReadContract({ address: poolAddress, abi: POOL_ABI, functionName: "spotsRemaining", watch: true });

  const USDC_ADDR = ADDRESSES.usdc || "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582";
  const USDC_ABI  = [{ name: "approve", type: "function", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }], stateMutability: "nonpayable" }];

  const { writeContract: doApprove,    data: approveHash, isPending: approvePending } = useWriteContract();
  const { writeContract: doJoin,       data: joinHash,    isPending: joinPending    } = useWriteContract();
  const { writeContract: doContribute, data: contribHash, isPending: contribPending } = useWriteContract();

  const { isSuccess: approveOk }  = useWaitForTransactionReceipt({ hash: approveHash });
  const { isSuccess: joinOk }     = useWaitForTransactionReceipt({ hash: joinHash });
  const { isSuccess: contribOk }  = useWaitForTransactionReceipt({ hash: contribHash });

  const [pendingAction, setPendingAction] = useState(null); // "join" | "contribute"

  useEffect(() => {
    if (!approveOk || !config) return;
    if (pendingAction === "join") {
      doJoin({ address: poolAddress, abi: POOL_ABI, functionName: "joinPool" });
      toast("Step 2/2: Joining pool...");
    }
    if (pendingAction === "contribute") {
      doContribute({ address: poolAddress, abi: POOL_ABI, functionName: "contribute" });
      toast("Step 2/2: Sending contribution...");
    }
  }, [approveOk]);

  useEffect(() => {
    if (joinOk)    { toast("✅ Joined pool! Collateral locked on chain."); rm(); ri(); setPendingAction(null); }
    if (contribOk) { toast("✅ Contribution sent successfully!"); rm(); ri(); setPendingAction(null); }
  }, [joinOk, contribOk]);

  if (!info || !config) return <div className="loading"><Loader size={14}/> Loading pool data...</div>;

  const [memberCount, round, status] = info;
  const sNum      = Number(status);
  const max       = Number(config.maxMembers);
  const collateral = config.monthlyAmount * BigInt(max) * BigInt(config.collateralBps) / 10000n;
  const canJoin    = sNum === 0 && !myMember?.isActive;
  const canPay     = sNum === 1 && myMember?.isActive && !myMember?.hasPaid;
  const anyPending = approvePending || joinPending || contribPending;

  const handleJoin = () => {
    setPendingAction("join");
    doApprove({ address: USDC_ADDR, abi: USDC_ABI, functionName: "approve", args: [poolAddress, collateral] });
    toast("Step 1/2: Approving USDC in MetaMask...");
  };

  const handleContribute = () => {
    setPendingAction("contribute");
    doApprove({ address: USDC_ADDR, abi: USDC_ABI, functionName: "approve", args: [poolAddress, config.monthlyAmount] });
    toast("Step 1/2: Approving USDC in MetaMask...");
  };

  return (
    <div className="page">
      <button className="back-btn" onClick={onBack}><ArrowLeft size={14}/> Back to pools</button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
            <div className="page-title" style={{ marginBottom: 0, fontSize: 18 }}>{shortAddr(poolAddress)}</div>
            {statusBadge(status)}
          </div>
          <div className="page-sub">{Number(memberCount)}/{max} members · Round {Number(round)}</div>
          <div style={{ fontSize: 10, color: "#aaa", marginTop: 4, fontFamily: "monospace" }}>{poolAddress}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {canJoin && (
            <button className="btn btn-gold" onClick={handleJoin} disabled={anyPending}>
              {anyPending ? <><Loader size={13}/>Processing...</> : <><Plus size={13}/>Join Pool</>}
            </button>
          )}
          {canPay && (
            <button className="btn btn-gold" onClick={handleContribute} disabled={anyPending}>
              {anyPending ? <><Loader size={13}/>Processing...</> : <><Zap size={13}/>Pay {fmtUSDC(config.monthlyAmount)}</>}
            </button>
          )}
        </div>
      </div>

      {anyPending && (
        <div className="tx-pending"><Loader size={14}/> Transaction in progress — check MetaMask...</div>
      )}

      <div className="tab-bar">
        {["info", "your status"].map(t => (
          <button key={t} className={`tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)} style={{ textTransform: "capitalize" }}>{t}</button>
        ))}
      </div>

      {tab === "info" && (
        <div className="card">
          {[
            ["Monthly Contribution",  fmtUSDC(config.monthlyAmount)],
            ["Total Pool per Round",  fmtUSDC(config.monthlyAmount * BigInt(max))],
            ["Total Cycle Value",     fmtUSDC(config.monthlyAmount * BigInt(max) * BigInt(max))],
            ["Collateral Required",   `${Number(config.collateralBps)/100}% = ${fmtUSDC(collateral)}`],
            ["Contribution Window",   `${Number(config.contributionWindow)} hours`],
            ["Platform Fee",          `${Number(config.platformFeeBps)/100}%`],
            ["Current Round",         `${Number(round)} of ${max}`],
            ["Status",                STATUS_MAP[sNum] || "Unknown"],
            ["Spots Remaining",       `${Number(spots || 0)}`],
          ].map(([k, v], i) => (
            <div className="info-row" key={i}>
              <span className="info-key">{k}</span>
              <span className="info-val">{v}</span>
            </div>
          ))}
          <div style={{ marginTop: 14, padding: "10px 12px", background: "#f5f4f0", borderRadius: 8 }}>
            <div style={{ fontSize: 10, color: "#888", marginBottom: 4 }}>Contract Address</div>
            <div style={{ fontSize: 11, fontFamily: "monospace", color: "#1a1a1a", display: "flex", alignItems: "center", gap: 8, wordBreak: "break-all" }}>
              {poolAddress}
              <Copy size={11} style={{ cursor: "pointer", flexShrink: 0 }}
                onClick={() => { navigator.clipboard.writeText(poolAddress); toast("Address copied!"); }}/>
              <a href={`https://amoy.polygonscan.com/address/${poolAddress}`} target="_blank" rel="noreferrer">
                <ExternalLink size={11} color="#888"/>
              </a>
            </div>
          </div>
        </div>
      )}

      {tab === "your status" && (
        <div className="card">
          {myMember ? (
            [
              ["Active Member",      myMember.isActive          ? "✅ Yes" : "❌ No"],
              ["Paid This Round",    myMember.hasPaid           ? "✅ Yes" : "⏳ Not yet"],
              ["Received Payout",    myMember.hasReceivedPayout ? "✅ Yes" : "⏳ Not yet"],
              ["Rotation Position",  myMember.rotationPosition > 0 ? `#${Number(myMember.rotationPosition)}` : "TBD (VRF pending)"],
              ["Collateral Locked",  fmtUSDC(myMember.collateral)],
              ["Total Contributed",  fmtUSDC(myMember.totalContributed)],
            ].map(([k, v], i) => (
              <div className="info-row" key={i}>
                <span className="info-key">{k}</span>
                <span className="info-val">{v}</span>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon"><Users size={20} color="#aaa"/></div>
              <p style={{ fontSize: 13 }}>You are not a member of this pool</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ALL hooks at top level — never inside if/return
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {

  // ── Wallet hooks (ALL at top level) ────────────────────────────────────────
  const { address, isConnected }  = useAccount();
  const { connect, connectors }   = useConnect();
  const { disconnect }            = useDisconnect();

  // ── App state ───────────────────────────────────────────────────────────────
  const [page, setPage]               = useState("dashboard");
  const [selectedPool, setSelectedPool] = useState(null);
  const [notif, setNotif]             = useState(null);
  const [cf, setCf]                   = useState({ monthly: "", members: "", collateral: "20", window: "120" });

  const toast = (msg) => { setNotif(msg); setTimeout(() => setNotif(null), 4000); };

  // ── Blockchain reads (ALL at top level) ────────────────────────────────────
  const { data: maticBalance } = useBalance({ address, watch: true });

  const { data: kmtiBalance } = useReadContract({
    address: ADDRESSES.token, abi: TOKEN_ABI, functionName: "balanceOf",
    args: [address], enabled: !!address, watch: true,
  });

  const { data: creditScore } = useReadContract({
    address: ADDRESSES.token, abi: TOKEN_ABI, functionName: "creditScore",
    args: [address], enabled: !!address,
  });

  const { data: cyclesDone } = useReadContract({
    address: ADDRESSES.token, abi: TOKEN_ABI, functionName: "cyclesCompleted",
    args: [address], enabled: !!address,
  });

  const { data: allPools, refetch: refetchPools } = useReadContract({
    address: ADDRESSES.factory, abi: FACTORY_ABI, functionName: "getAllPools", watch: true,
  });

  const { data: totalPools } = useReadContract({
    address: ADDRESSES.factory, abi: FACTORY_ABI, functionName: "getTotalPools", watch: true,
  });

  // ── Create pool ─────────────────────────────────────────────────────────────
  const { writeContract: doCreate, data: createHash, isPending: createPending } = useWriteContract();
  const { isSuccess: createOk } = useWaitForTransactionReceipt({ hash: createHash });

  useEffect(() => {
    if (createOk) {
      toast("✅ Pool deployed on Polygon Amoy!");
      refetchPools();
      setPage("browse");
      setCf({ monthly: "", members: "", collateral: "20", window: "120" });
    }
  }, [createOk]);

  // ── Formatted values ────────────────────────────────────────────────────────
  const maticFmt  = maticBalance ? Number(formatUnits(maticBalance.value, 18)).toFixed(4) : "0.0000";
  const kmtiFmt   = kmtiBalance  ? Number(formatUnits(kmtiBalance, 18)).toLocaleString("en-IN") : "0";
  const scoreNum  = Number(creditScore || 0n);
  const cyclesNum = Number(cyclesDone  || 0n);
  const totalNum  = Number(totalPools  || 0n);
  const pools     = allPools || [];

  // ── Wallet icons ─────────────────────────────────────────────────────────────
  const walletIcons = {
    MetaMask      : "🦊",
    "Trust Wallet": "🛡️",
    WalletConnect : "🔗",
    Coinbase      : "🔵",
    Rainbow       : "🌈",
    Injected      : "💼",
  };

  // ── Connect screen ──────────────────────────────────────────────────────────
  if (!isConnected) return (
    <div className="connect-screen">
      <style>{css}</style>
      {notif && <div className="notif"><CheckCircle size={14} color="#3B6D11"/>{notif}</div>}
      <div className="connect-card">
        <div className="connect-logo">ਕਮੇਟੀ</div>
        <div className="connect-chain">Blockchain · Polygon Amoy</div>
        <p style={{ fontSize: 13, color: "#666", marginBottom: 28, lineHeight: 1.6 }}>
          A transparent, yield-generating rotating savings platform built on blockchain.
          Join or create a Kameti pool — fully trustless.
        </p>

        {connectors.length > 0 ? (
          connectors.map((connector) => (
            <button
              key={connector.uid}
              className="wallet-option"
              onClick={() => {
                connect({ connector });
                toast("Connecting wallet...");
              }}
            >
              <div className="wallet-icon">
                {walletIcons[connector.name] || "💼"}
              </div>
              <span>{connector.name}</span>
            </button>
          ))
        ) : (
          <div style={{ fontSize: 13, color: "#888", padding: "20px 0" }}>
            No wallets detected. Please install MetaMask.
          </div>
        )}

        <p style={{ fontSize: 11, color: "#aaa", marginTop: 18 }}>
          Polygon Amoy Testnet · No real funds
        </p>
      </div>
    </div>
  );

  // ── Pool detail page ────────────────────────────────────────────────────────
  if (page === "detail" && selectedPool) return (
    <div className="app">
      <style>{css}</style>
      {notif && <div className="notif"><CheckCircle size={14} color="#3B6D11"/>{notif}</div>}
      <Sidebar
        page={page} setPage={setPage} address={address}
        maticFmt={maticFmt} kmtiFmt={kmtiFmt} disconnect={disconnect}
      />
      <main className="main">
        <PoolDetail
          poolAddress={selectedPool}
          myAddress={address}
          onBack={() => setPage("browse")}
          toast={toast}
        />
      </main>
    </div>
  );

  // ── Nav items ───────────────────────────────────────────────────────────────
  const navItems = [
    { id: "dashboard", label: "Dashboard",    icon: <BarChart2/> },
    { id: "my-pools",  label: "My Pools",     icon: <Users/>     },
    { id: "browse",    label: "Browse Pools", icon: <TrendingUp/>},
    { id: "create",    label: "Create Pool",  icon: <Plus/>      },
    { id: "profile",   label: "Profile",      icon: <Award/>     },
  ];

  // ── Page: Dashboard ─────────────────────────────────────────────────────────
  const renderDashboard = () => (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Dashboard</div>
        <div className="page-sub">Welcome back, {shortAddr(address)}</div>
      </div>
      <div className="stats-grid">
        {[
          { label: "Total Pools",   value: totalNum,          sub: "on Amoy testnet"       },
          { label: "Your Cycles",   value: cyclesNum,         sub: "completed"             },
          { label: "KMTI Balance",  value: kmtiFmt,           sub: "governance tokens"     },
          { label: "Credit Score",  value: `${scoreNum}/1000`, sub: "on-chain reputation", accent: true },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-value ${s.accent ? "stat-accent" : ""}`}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>
      <div className="yield-banner">
        <div className="yield-icon"><TrendingUp size={18} color={GOLD}/></div>
        <div>
          <div className="yield-title">Contracts Live on Polygon Amoy</div>
          <div className="yield-sub">KametiToken · KametiFactory · KametiYield all deployed</div>
        </div>
        <div className="yield-amount">{totalNum} Pools</div>
      </div>
      <div>
        <div className="section-header">
          <div className="section-title">All Pools</div>
          <button className="btn" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => setPage("browse")}>
            View all <ChevronRight size={12}/>
          </button>
        </div>
        {pools.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-icon"><Users size={20} color="#aaa"/></div>
            <p style={{ fontSize: 14, marginBottom: 10 }}>No pools yet — be the first!</p>
            <button className="btn btn-gold" onClick={() => setPage("create")}>
              <Plus size={14}/> Create First Pool
            </button>
          </div>
        ) : (
          <div className="pool-grid">
            {pools.slice(0, 4).map(addr => (
              <PoolCard key={addr} poolAddress={addr} myAddress={address}
                onSelect={(a) => { setSelectedPool(a); setPage("detail"); }}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ── Page: Browse ────────────────────────────────────────────────────────────
  const renderBrowse = () => (
    <div className="page">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="page-title">Browse Pools</div>
            <div className="page-sub">{totalNum} pool{totalNum !== 1 ? "s" : ""} on Amoy testnet</div>
          </div>
          <button className="btn btn-gold" onClick={() => setPage("create")}>
            <Plus size={14}/> Create Pool
          </button>
        </div>
      </div>
      {pools.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon"><Users size={20} color="#aaa"/></div>
          <p style={{ fontSize: 14, marginBottom: 10 }}>No pools created yet</p>
          <button className="btn btn-gold" onClick={() => setPage("create")}>
            <Plus size={14}/> Create First Pool
          </button>
        </div>
      ) : (
        <div className="pool-grid">
          {pools.map(addr => (
            <PoolCard key={addr} poolAddress={addr} myAddress={address}
              onSelect={(a) => { setSelectedPool(a); setPage("detail"); }}/>
          ))}
        </div>
      )}
    </div>
  );

  // ── Page: My Pools ──────────────────────────────────────────────────────────
  const renderMyPools = () => (
    <div className="page">
      <div className="page-header">
        <div className="page-title">My Pools</div>
        <div className="page-sub">All pools on Amoy testnet</div>
      </div>
      {pools.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon"><Users size={20} color="#aaa"/></div>
          <p style={{ fontSize: 14, marginBottom: 10 }}>No pools yet</p>
          <button className="btn btn-gold" onClick={() => setPage("browse")}>
            <Users size={14}/> Browse Pools
          </button>
        </div>
      ) : (
        <div className="pool-grid">
          {pools.map(addr => (
            <PoolCard key={addr} poolAddress={addr} myAddress={address}
              onSelect={(a) => { setSelectedPool(a); setPage("detail"); }}/>
          ))}
        </div>
      )}
    </div>
  );

  // ── Page: Create Pool ───────────────────────────────────────────────────────
  const handleCreate = () => {
    if (!cf.monthly || !cf.members) { toast("⚠️ Fill all required fields"); return; }
    doCreate({
      address: ADDRESSES.factory, abi: FACTORY_ABI, functionName: "createPool",
      args: [
        parseUnits(cf.monthly, 6),
        BigInt(cf.members),
        BigInt(Number(cf.collateral) * 100),
        BigInt(cf.window),
        100n,
      ],
    });
  };

  const renderCreate = () => (
    <div className="page">
      <button className="back-btn" onClick={() => setPage("browse")}><ArrowLeft size={14}/> Back</button>
      <div className="page-header">
        <div className="page-title">Create New Pool</div>
        <div className="page-sub">Deploy a KametiPool smart contract on Polygon Amoy</div>
      </div>
      <div className="card" style={{ maxWidth: 560 }}>
        {createPending && <div className="tx-pending"><Loader size={14}/> Deploying — confirm in MetaMask...</div>}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Monthly Amount (USDC)</label>
            <input className="form-input" type="number" placeholder="e.g. 5000"
              value={cf.monthly} onChange={e => setCf(f => ({ ...f, monthly: e.target.value }))}/>
            <div className="form-hint">Amount per member per month</div>
          </div>
          <div className="form-group">
            <label className="form-label">Max Members</label>
            <input className="form-input" type="number" placeholder="e.g. 10" min="2" max="100"
              value={cf.members} onChange={e => setCf(f => ({ ...f, members: e.target.value }))}/>
            <div className="form-hint">Between 2 and 100</div>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Collateral %</label>
            <input className="form-input" type="number" placeholder="20"
              value={cf.collateral} onChange={e => setCf(f => ({ ...f, collateral: e.target.value }))}/>
            <div className="form-hint">Max 50%</div>
          </div>
          <div className="form-group">
            <label className="form-label">Window (hours)</label>
            <input className="form-input" type="number" placeholder="120"
              value={cf.window} onChange={e => setCf(f => ({ ...f, window: e.target.value }))}/>
            <div className="form-hint">Min 24 hours</div>
          </div>
        </div>
        {cf.monthly && cf.members && (
          <div style={{ background: "#f5f4f0", borderRadius: 10, padding: 16, marginBottom: 18 }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 10, fontWeight: 500 }}>Pool Summary</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                ["Pot per Round",     fmtINR(cf.monthly * cf.members)],
                ["Total Cycle",       fmtINR(cf.monthly * cf.members * cf.members)],
                ["Collateral/Member", fmtINR(cf.monthly * cf.members * cf.collateral / 100)],
                ["Est. Yield (8%)",   fmtINR(Math.round(cf.monthly * cf.members * 0.08 * cf.members / 12))],
              ].map(([k, v], i) => (
                <div key={i} style={{ fontSize: 13 }}>
                  <div style={{ color: "#888", fontSize: 11 }}>{k}</div>
                  <div style={{ fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn" onClick={() => setPage("browse")}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCreate} disabled={createPending}>
            {createPending ? <><Loader size={14}/> Deploying...</> : <><Plus size={14}/> Deploy Pool Contract</>}
          </button>
        </div>
      </div>
    </div>
  );

  // ── Page: Profile ───────────────────────────────────────────────────────────
  const renderProfile = () => (
    <div className="page">
      <div className="page-header">
        <div className="page-title">My Profile</div>
        <div className="page-sub">On-chain identity and credit score</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Wallet</div>
            <div style={{ fontFamily: "monospace", fontSize: 11, color: "#1a1a1a", wordBreak: "break-all", marginBottom: 4 }}>{address}</div>
            <div style={{ fontSize: 11, color: "#aaa" }}>Polygon Amoy Testnet</div>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "0.5px solid #f0ede6" }}>
              {[
                ["MATIC Balance",  `${maticFmt} MATIC`],
                ["KMTI Balance",   `${kmtiFmt} KMTI`],
                ["Cycles Done",    cyclesNum],
                ["Credit Score",   `${scoreNum} / 1000`],
              ].map(([k, v], i) => (
                <div className="info-row" key={i} style={{ fontSize: 13 }}>
                  <span className="info-key">{k}</span>
                  <span className="info-val">{v}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-outline" style={{ width: "100%", justifyContent: "center", marginTop: 14 }}
              onClick={() => disconnect()}>
              <LogOut size={14}/> Disconnect Wallet
            </button>
          </div>
          <div className="card">
            <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Deployed Contracts</div>
            {[
              ["KametiToken",   ADDRESSES.token],
              ["KametiFactory", ADDRESSES.factory],
              ["KametiYield",   ADDRESSES.yield],
            ].map(([k, v], i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "#888" }}>{k}</div>
                <div style={{ fontSize: 11, fontFamily: "monospace", color: "#1a1a1a", display: "flex", gap: 6, alignItems: "center" }}>
                  {shortAddr(v)}
                  <a href={`https://amoy.polygonscan.com/address/${v}`} target="_blank" rel="noreferrer">
                    <ExternalLink size={10} color="#888"/>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="card" style={{ marginBottom: 16, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Credit Score</div>
            <svg viewBox="0 0 120 120" width="120" height="120" style={{ display: "block", margin: "0 auto 12px" }}>
              <circle cx="60" cy="60" r="50" fill="none" stroke="#f0ede6" strokeWidth="10"/>
              <circle cx="60" cy="60" r="50" fill="none" stroke={GOLD} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${2*Math.PI*50*scoreNum/1000} ${2*Math.PI*50*(1-scoreNum/1000)}`}
                strokeDashoffset={2*Math.PI*50*0.25}/>
              <text x="60" y="55" textAnchor="middle" fontSize="22" fontWeight="700" fill="#1a1a1a" fontFamily="Syne">{scoreNum}</text>
              <text x="60" y="72" textAnchor="middle" fontSize="10" fill="#888" fontFamily="DM Sans">/ 1000</text>
            </svg>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "0.5px solid #f0ede6", textAlign: "left" }}>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Collateral Discount</div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${scoreNum/10}%` }}/></div>
              <div style={{ fontSize: 12, color: "#1a1a1a", marginTop: 6, fontWeight: 500 }}>
                {(scoreNum*50/100).toFixed(0)} bps off collateral
              </div>
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Score Formula</div>
            {[
              ["Cycles × 50", `${cyclesNum} × 50 = ${cyclesNum*50}`],
              ["KMTI bonus",  `+${Math.floor(Number(kmtiBalance||0n)/1e21)}`],
              ["Total",       `${scoreNum} / 1000`],
            ].map(([k, v], i) => (
              <div className="info-row" key={i} style={{ fontSize: 13 }}>
                <span className="info-key">{k}</span>
                <span className="info-val" style={{ color: i===2 ? GOLD : undefined }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ── Full app layout ─────────────────────────────────────────────────────────
  return (
    <div className="app">
      <style>{css}</style>
      {notif && <div className="notif"><CheckCircle size={14} color="#3B6D11"/>{notif}</div>}
      <Sidebar
        page={page} setPage={setPage} address={address}
        maticFmt={maticFmt} kmtiFmt={kmtiFmt} disconnect={disconnect}
        navItems={navItems}
      />
      <main className="main">
        {page === "dashboard" && renderDashboard()}
        {page === "my-pools"  && renderMyPools()}
        {page === "browse"    && renderBrowse()}
        {page === "create"    && renderCreate()}
        {page === "profile"   && renderProfile()}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function Sidebar({ page, setPage, address, maticFmt, kmtiFmt, disconnect, navItems }) {
  const items = navItems || [
    { id: "dashboard", label: "Dashboard",    icon: <BarChart2/> },
    { id: "my-pools",  label: "My Pools",     icon: <Users/>     },
    { id: "browse",    label: "Browse Pools", icon: <TrendingUp/>},
    { id: "create",    label: "Create Pool",  icon: <Plus/>      },
    { id: "profile",   label: "Profile",      icon: <Award/>     },
  ];

  const GOLD = "#D4A017";
  const NAVY = "#0D1B2A";

  return (
    <div style={{ width: 240, background: NAVY, display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "28px 24px 20px", borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>ਕਮੇਟੀ</div>
        <div style={{ fontSize: 10, color: GOLD, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase", marginTop: 2 }}>Blockchain</div>
      </div>
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.2)", padding: "12px 12px 4px" }}>Main</div>
        {items.map(n => (
          <button key={n.id}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, cursor: "pointer", color: page === n.id ? GOLD : "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: page === n.id ? 500 : 400, transition: "all 0.15s", border: "none", background: page === n.id ? "rgba(212,160,23,0.15)" : "none", width: "100%", textAlign: "left", fontFamily: "'DM Sans', sans-serif" }}
            onClick={() => setPage(n.id)}>
            {n.icon}{n.label}
          </button>
        ))}
      </nav>
      <div style={{ padding: "16px 12px 24px", borderTop: "0.5px solid rgba(255,255,255,0.08)" }}>
        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 12, border: "0.5px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Connected</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontFamily: "monospace" }}>{address ? `${address.slice(0,6)}...${address.slice(-4)}` : ""}</div>
          <div style={{ fontSize: 13, color: GOLD, fontWeight: 500, marginTop: 6 }}>{maticFmt} MATIC · {kmtiFmt} KMTI</div>
        </div>
        <button
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, cursor: "pointer", color: "rgba(255,255,255,0.3)", fontSize: 14, transition: "all 0.15s", border: "none", background: "none", width: "100%", marginTop: 8, fontFamily: "'DM Sans', sans-serif" }}
          onClick={() => disconnect()}>
          <LogOut size={14}/> Disconnect
        </button>
      </div>
    </div>
  );
}
