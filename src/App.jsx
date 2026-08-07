// ─────────────────────────────────────────────────────────────────────────────
// KAMETI DAPP — v4
// Theme: Matches Lovable landing page (dark navy + mint green)
// Feature: Light / Dark toggle
// Fix: chainId 80002 on all reads — MATIC balance + pools now show correctly
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, createContext, useContext } from "react";
import {
  useAccount, useConnect, useDisconnect,
  useReadContract, useWriteContract,
  useWaitForTransactionReceipt, useBalance,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import {
  Users, Plus, TrendingUp, ChevronRight,
  CheckCircle, Clock, AlertCircle, Award, ArrowLeft,
  Copy, ExternalLink, Zap, BarChart2,
  LogOut, Loader, Sun, Moon,
} from "lucide-react";
import { ADDRESSES, FACTORY_ABI, POOL_ABI, TOKEN_ABI } from "./config/contracts.js";

const CHAIN_ID = 80002;

const ThemeCtx = createContext({ dark: true, toggle: () => {} });
const useTheme = () => useContext(ThemeCtx);

const DARK = {
  bg:"#0A0F1A", surface:"#111827", surfaceUp:"#1A2236", surfaceHover:"#1E2D45",
  green:"#22C55E", greenHover:"#16A34A", greenGlow:"rgba(34,197,94,0.15)", greenBorder:"rgba(34,197,94,0.35)",
  text:"#F9FAFB", muted:"#6B7280", mutedUp:"#9CA3AF",
  border:"rgba(255,255,255,0.08)", borderUp:"rgba(255,255,255,0.16)",
  amber:"#F59E0B", amberGlow:"rgba(245,158,11,0.15)", amberBorder:"rgba(245,158,11,0.35)",
  blue:"#3B82F6", blueGlow:"rgba(59,130,246,0.15)", blueBorder:"rgba(59,130,246,0.35)",
  red:"#EF4444", redGlow:"rgba(239,68,68,0.1)", redBorder:"rgba(239,68,68,0.3)",
  shadow:"0 4px 24px rgba(0,0,0,0.5)",
};

const LIGHT = {
  bg:"#F3F4F6", surface:"#FFFFFF", surfaceUp:"#F9FAFB", surfaceHover:"#F3F4F6",
  green:"#16A34A", greenHover:"#15803D", greenGlow:"rgba(22,163,74,0.1)", greenBorder:"rgba(22,163,74,0.35)",
  text:"#111827", muted:"#6B7280", mutedUp:"#4B5563",
  border:"rgba(0,0,0,0.08)", borderUp:"rgba(0,0,0,0.18)",
  amber:"#D97706", amberGlow:"rgba(217,119,6,0.1)", amberBorder:"rgba(217,119,6,0.35)",
  blue:"#2563EB", blueGlow:"rgba(37,99,235,0.1)", blueBorder:"rgba(37,99,235,0.35)",
  red:"#DC2626", redGlow:"rgba(220,38,38,0.08)", redBorder:"rgba(220,38,38,0.3)",
  shadow:"0 4px 24px rgba(0,0,0,0.1)",
};

const makeCSS = (T) => `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html{-webkit-font-smoothing:antialiased;}
  body{background:${T.bg};color:${T.text};font-family:'Inter',sans-serif;font-size:14px;transition:background .25s,color .25s;}
  .k-app{display:flex;min-height:100vh;}
  .k-main{flex:1;overflow-y:auto;background:${T.bg};}
  .k-page{padding:32px 36px;max-width:900px;}
  .k-sidebar{width:240px;flex-shrink:0;background:${T.surface};border-right:1px solid ${T.border};display:flex;flex-direction:column;position:sticky;top:0;height:100vh;transition:background .25s;}
  .k-logo-wrap{padding:20px 18px 18px;border-bottom:1px solid ${T.border};display:flex;align-items:center;justify-content:space-between;}
  .k-logo-inner{display:flex;align-items:center;gap:10px;}
  .k-logo-icon{width:32px;height:32px;border-radius:8px;background:${T.green};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:#fff;flex-shrink:0;}
  .k-logo-name{font-weight:700;font-size:15px;color:${T.text};}
  .k-logo-tag{font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:${T.green};}
  .k-toggle{width:30px;height:30px;border-radius:8px;border:1px solid ${T.border};background:${T.surfaceUp};display:flex;align-items:center;justify-content:center;cursor:pointer;color:${T.muted};transition:all .15s;flex-shrink:0;}
  .k-toggle:hover{border-color:${T.green};color:${T.green};background:${T.greenGlow};}
  .k-nav{flex:1;padding:14px 10px;display:flex;flex-direction:column;gap:2px;}
  .k-nav-label{font-family:'IBM Plex Mono',monospace;font-size:9.5px;letter-spacing:1.5px;text-transform:uppercase;color:${T.muted};padding:10px 10px 5px;}
  .k-nav-item{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:8px;cursor:pointer;font-size:13.5px;color:${T.muted};border:none;background:none;width:100%;text-align:left;font-family:'Inter',sans-serif;transition:all .15s;}
  .k-nav-item:hover{color:${T.text};background:${T.surfaceUp};}
  .k-nav-item.active{color:${T.green};font-weight:500;background:${T.greenGlow};}
  .k-nav-item svg{width:15px;height:15px;flex-shrink:0;}
  .k-wallet-box{padding:12px 10px 18px;border-top:1px solid ${T.border};}
  .k-wallet-card{background:${T.surfaceUp};border:1px solid ${T.border};border-radius:10px;padding:12px 13px;margin-bottom:8px;}
  .k-wallet-lbl{font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:${T.muted};margin-bottom:5px;}
  .k-wallet-addr{font-family:'IBM Plex Mono',monospace;font-size:11.5px;color:${T.mutedUp};}
  .k-wallet-bal{font-size:12px;color:${T.green};font-weight:600;margin-top:5px;font-family:'IBM Plex Mono',monospace;}
  .k-pill{display:inline-flex;align-items:center;gap:6px;font-family:'IBM Plex Mono',monospace;font-size:9.5px;color:${T.muted};border:1px solid ${T.border};padding:4px 9px;border-radius:99px;margin-bottom:6px;}
  .k-pill-dot{width:6px;height:6px;border-radius:50%;background:${T.green};animation:blink 2.2s ease-in-out infinite;flex-shrink:0;}
  @keyframes blink{0%,100%{opacity:1;}50%{opacity:.3;}}
  .k-disconnect{display:flex;align-items:center;gap:8px;padding:8px 10px;width:100%;font-size:12.5px;color:${T.muted};background:none;border:none;cursor:pointer;border-radius:7px;font-family:'Inter',sans-serif;transition:all .15s;}
  .k-disconnect:hover{color:${T.red};background:${T.redGlow};}
  .k-ph{margin-bottom:24px;}
  .k-page-title{font-size:22px;font-weight:700;color:${T.text};letter-spacing:-.3px;}
  .k-page-sub{font-size:13px;color:${T.muted};margin-top:4px;}
  .k-eyebrow{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:${T.green};margin-bottom:5px;display:block;}
  .k-ticker{border-top:1px solid ${T.border};border-bottom:1px solid ${T.border};padding:11px 0;margin-bottom:24px;overflow:hidden;}
  .k-ticker-inner{display:flex;gap:28px;animation:ticker 24s linear infinite;width:max-content;}
  @keyframes ticker{from{transform:translateX(0);}to{transform:translateX(-50%);}}
  .k-ticker-item{font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:${T.muted};white-space:nowrap;display:flex;align-items:center;gap:8px;}
  .k-ticker-dot{width:4px;height:4px;border-radius:50%;background:${T.green};flex-shrink:0;}
  .k-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px;}
  .k-stat{background:${T.surface};border:1px solid ${T.border};border-radius:12px;padding:16px 18px;}
  .k-stat-lbl{font-family:'IBM Plex Mono',monospace;font-size:9.5px;color:${T.muted};font-weight:500;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;}
  .k-stat-val{font-size:21px;font-weight:700;color:${T.text};}
  .k-stat-val.accent{color:${T.green};}
  .k-stat-sub{font-size:11px;color:${T.muted};margin-top:3px;}
  .k-banner{background:${T.surface};border:1px solid ${T.border};border-radius:12px;padding:15px 18px;margin-bottom:22px;display:flex;align-items:center;gap:13px;}
  .k-banner-icon{width:36px;height:36px;border-radius:9px;background:${T.greenGlow};display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .k-banner-title{font-size:13.5px;font-weight:600;color:${T.text};}
  .k-banner-sub{font-size:11.5px;color:${T.muted};margin-top:2px;}
  .k-banner-val{margin-left:auto;font-size:18px;font-weight:700;color:${T.green};font-family:'IBM Plex Mono',monospace;}
  .k-sec-hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:13px;}
  .k-sec-t{font-size:14px;font-weight:600;color:${T.text};}
  .k-pool-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:13px;}
  .k-pool-card{background:${T.surface};border:1px solid ${T.border};border-radius:12px;cursor:pointer;overflow:hidden;transition:border-color .15s,background .15s;}
  .k-pool-card:hover{border-color:${T.borderUp};background:${T.surfaceHover};}
  .k-pool-accent{height:2px;}
  .k-pool-body{padding:17px 19px 19px;}
  .k-pool-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:11px;}
  .k-pool-addr{font-family:'IBM Plex Mono',monospace;font-size:11px;color:${T.muted};}
  .k-pool-lbl{font-size:11px;color:${T.muted};margin-bottom:3px;}
  .k-pool-amt{font-size:22px;font-weight:700;color:${T.text};}
  .k-pool-meta{display:flex;gap:14px;margin-top:12px;padding-top:12px;border-top:1px solid ${T.border};}
  .k-pool-mi{font-size:11.5px;color:${T.muted};display:flex;align-items:center;gap:4px;}
  .k-pool-mi svg{width:11px;height:11px;}
  .k-prog{height:3px;background:${T.surfaceUp};border-radius:99px;margin-top:11px;overflow:hidden;}
  .k-prog-fill{height:100%;border-radius:99px;}
  .k-member-tag{margin-top:9px;font-size:11px;color:${T.green};font-weight:500;display:flex;align-items:center;gap:4px;}
  .k-badge{display:inline-flex;align-items:center;gap:4px;font-size:10.5px;font-weight:500;padding:3px 8px;border-radius:6px;}
  .k-b-open{background:${T.greenGlow};color:${T.green};border:1px solid ${T.greenBorder};}
  .k-b-act{background:${T.amberGlow};color:${T.amber};border:1px solid ${T.amberBorder};}
  .k-b-done{background:${T.blueGlow};color:${T.blue};border:1px solid ${T.blueBorder};}
  .k-b-pau{background:${T.surfaceUp};color:${T.muted};border:1px solid ${T.border};}
  .k-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:8px;font-size:13.5px;font-weight:500;cursor:pointer;border:1px solid transparent;transition:all .15s;font-family:'Inter',sans-serif;white-space:nowrap;}
  .k-btn svg{width:14px;height:14px;}
  .k-btn:disabled{opacity:.4;cursor:not-allowed;}
  .k-btn-green{background:${T.green};color:#fff;border-color:${T.green};}
  .k-btn-green:hover:not(:disabled){background:${T.greenHover};transform:translateY(-1px);}
  .k-btn-ghost{background:transparent;color:${T.text};border-color:${T.border};}
  .k-btn-ghost:hover:not(:disabled){border-color:${T.green};color:${T.green};background:${T.greenGlow};}
  .k-btn-danger{background:transparent;color:${T.red};border-color:${T.redBorder};}
  .k-btn-danger:hover:not(:disabled){background:${T.redGlow};}
  .k-btn-sm{padding:7px 13px;font-size:12.5px;}
  .k-card{background:${T.surface};border:1px solid ${T.border};border-radius:12px;padding:22px;}
  .k-ir{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid ${T.border};font-size:13.5px;}
  .k-ir:last-child{border-bottom:none;}
  .k-ik{color:${T.muted};}
  .k-iv{color:${T.text};font-weight:500;}
  .k-fg{margin-bottom:15px;}
  .k-fl{font-size:12.5px;font-weight:500;color:${T.mutedUp};margin-bottom:6px;display:block;}
  .k-fh{font-size:11px;color:${T.muted};margin-top:5px;}
  .k-fr{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
  .k-inp{width:100%;padding:10px 13px;background:${T.surfaceUp};color:${T.text};border:1px solid ${T.border};border-radius:8px;font-size:13.5px;font-family:'Inter',sans-serif;transition:border-color .15s;outline:none;}
  .k-inp:focus{border-color:${T.green};box-shadow:0 0 0 3px ${T.greenGlow};}
  .k-inp::placeholder{color:${T.muted};}
  .k-sum{background:${T.surfaceUp};border:1px solid ${T.border};border-radius:10px;padding:15px 17px;margin-bottom:17px;}
  .k-sum-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px;}
  .k-sk{font-family:'IBM Plex Mono',monospace;font-size:10px;color:${T.muted};text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px;}
  .k-sv{font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:600;color:${T.text};}
  .k-pending{background:${T.amberGlow};border:1px solid ${T.amberBorder};border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:13px;color:${T.amber};display:flex;align-items:center;gap:8px;}
  .k-tabs{display:flex;gap:3px;margin-bottom:17px;background:${T.surfaceUp};padding:4px;border-radius:9px;width:fit-content;}
  .k-tab{padding:7px 16px;border-radius:7px;font-size:12.5px;cursor:pointer;border:none;background:none;color:${T.muted};font-family:'Inter',sans-serif;transition:all .15s;}
  .k-tab.active{background:${T.surface};color:${T.text};font-weight:500;border:1px solid ${T.border};}
  .k-back{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;color:${T.muted};cursor:pointer;border:none;background:none;padding:0;margin-bottom:20px;font-family:'Inter',sans-serif;transition:color .15s;}
  .k-back:hover{color:${T.green};}
  .k-empty{text-align:center;padding:44px 24px;color:${T.muted};}
  .k-empty-icon{margin:0 auto 13px;width:44px;height:44px;border-radius:10px;background:${T.surfaceUp};border:1px solid ${T.border};display:flex;align-items:center;justify-content:center;}
  .k-loading{display:flex;align-items:center;gap:8px;color:${T.muted};font-size:13px;padding:20px;}
  .k-notif{position:fixed;top:20px;right:20px;background:${T.surface};border:1px solid ${T.greenBorder};border-radius:10px;padding:12px 16px;font-size:13px;display:flex;align-items:center;gap:8px;box-shadow:${T.shadow};z-index:999;animation:slideIn .2s ease;color:${T.text};}
  @keyframes slideIn{from{transform:translateX(16px);opacity:0;}to{transform:none;opacity:1;}}
  .k-cs{min-height:100vh;display:flex;align-items:center;justify-content:center;background:${T.bg};position:relative;}
  .k-cc{background:${T.surface};border:1px solid ${T.border};border-radius:16px;padding:42px 36px;text-align:center;max-width:400px;width:100%;}
  .k-cc-logo{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:6px;}
  .k-cc-icon{width:36px;height:36px;border-radius:9px;background:${T.green};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;color:#fff;}
  .k-cc-name{font-size:24px;font-weight:700;color:${T.text};}
  .k-cc-sub{font-family:'IBM Plex Mono',monospace;font-size:9.5px;letter-spacing:2.5px;text-transform:uppercase;color:${T.green};margin:7px 0 22px;}
  .k-cc-desc{font-size:13.5px;color:${T.muted};line-height:1.7;margin-bottom:22px;}
  .k-wo{display:flex;align-items:center;gap:13px;padding:13px 15px;border-radius:9px;border:1px solid ${T.border};background:${T.surfaceUp};cursor:pointer;width:100%;font-size:13.5px;font-weight:500;color:${T.text};margin-bottom:8px;font-family:'Inter',sans-serif;transition:all .15s;text-align:left;}
  .k-wo:hover{border-color:${T.green};background:${T.greenGlow};color:${T.green};}
  .k-we{font-size:20px;width:28px;text-align:center;flex-shrink:0;}
  .k-cc-note{font-size:11px;color:${T.muted};margin-top:18px;line-height:1.6;}
  .k-cs-tgl{position:absolute;top:20px;right:20px;}
  .k-ab{background:${T.surfaceUp};border:1px solid ${T.border};border-radius:8px;padding:10px 13px;margin:12px 0 8px;font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:${T.muted};display:flex;align-items:center;gap:10px;word-break:break-all;}
  .k-ab button{background:none;border:none;cursor:pointer;color:${T.muted};flex-shrink:0;transition:color .15s;padding:0;}
  .k-ab button:hover{color:${T.green};}
  .k-ab a{color:${T.muted};transition:color .15s;flex-shrink:0;}
  .k-ab a:hover{color:${T.green};}
  .k-dn{font-family:'IBM Plex Mono',monospace;font-size:10px;color:${T.muted};margin-bottom:2px;margin-top:12px;}
  .k-da{font-family:'IBM Plex Mono',monospace;font-size:11.5px;color:${T.mutedUp};display:flex;gap:7px;align-items:center;}
  .k-da a{color:${T.muted};transition:color .15s;}
  .k-da a:hover{color:${T.green};}
  @media(prefers-reduced-motion:reduce){.k-ticker-inner,.k-pill-dot{animation:none;}}
  @media(max-width:768px){.k-app{flex-direction:column;}.k-sidebar{width:100%;height:auto;position:relative;border-right:none;border-bottom:1px solid rgba(255,255,255,0.08);}.k-logo-wrap{padding:14px 16px;}.k-nav{flex-direction:row;padding:8px 10px;overflow-x:auto;gap:4px;flex:unset;}.k-nav-label{display:none;}.k-nav-item{padding:8px 10px;font-size:12px;white-space:nowrap;border-radius:7px;}.k-wallet-box{display:none;}.k-page{padding:16px 14px;}.k-stats{grid-template-columns:repeat(2,1fr);}.k-pool-grid{grid-template-columns:1fr;}.k-fr{grid-template-columns:1fr;}.k-sum-grid{grid-template-columns:1fr;}.k-cc{padding:32px 20px;max-width:100%;margin:0 16px;}.k-banner{flex-wrap:wrap;}.k-banner-val{margin-left:0;width:100%;margin-top:8px;}.k-page-title{font-size:18px;}.k-stat-val{font-size:18px;}.k-btn{font-size:12.5px;padding:9px 14px;}.k-sec-hd{flex-wrap:wrap;gap:8px;}}
`;

const fmtUSDC   = (n) => `₹${Number(formatUnits(n || 0n, 6)).toLocaleString("en-IN")}`;
const fmtINR    = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const shortAddr = (a) => a ? `${a.slice(0,6)}...${a.slice(-4)}` : "";
const STATUS    = { 0:"Open", 1:"Active", 2:"Completed", 3:"Paused" };
const parseConfig = (c) => {
  if (!c) return null;
  return {
    monthlyAmount:c[0]??c.monthlyAmount??0n, maxMembers:c[1]??c.maxMembers??0n,
    collateralBps:c[2]??c.collateralBps??0n, contributionWindow:c[3]??c.contributionWindow??0n,
    platformFeeBps:c[4]??c.platformFeeBps??0n,
  };
};
const statusBadge = (s) => {
  const n=Number(s);
  const cls={0:"k-b-open",1:"k-b-act",2:"k-b-done",3:"k-b-pau"};
  const icons={0:<Clock size={9}/>,1:<Zap size={9}/>,2:<CheckCircle size={9}/>,3:<AlertCircle size={9}/>};
  return <span className={`k-badge ${cls[n]}`}>{icons[n]} {STATUS[n]||"Unknown"}</span>;
};
const accentColor=(s,T)=>({0:T.green,1:T.amber,2:T.blue,3:T.muted}[Number(s)]||T.muted);
const TICKER=["// BUILT WITH","SOLIDITY","POLYGON","AAVE V3","HARDHAT","ETHERS.JS","OPENZEPPELIN","CHAINLINK VRF","WAGMI","REACT","VIEM"];

function ThemeToggle(){
  const{dark,toggle}=useTheme();
  return <button className="k-toggle" onClick={toggle} title={dark?"Light mode":"Dark mode"}>{dark?<Sun size={14}/>:<Moon size={14}/>}</button>;
}

function PoolCard({poolAddress,onSelect,myAddress}){
  const{dark}=useTheme(); const T=dark?DARK:LIGHT;
  const{data:info}=useReadContract({address:poolAddress,abi:POOL_ABI,functionName:"getPoolInfo",chainId:CHAIN_ID,watch:true});
  const{data:configRaw}=useReadContract({address:poolAddress,abi:POOL_ABI,functionName:"config",chainId:CHAIN_ID});
  const{data:myMember}=useReadContract({address:poolAddress,abi:POOL_ABI,functionName:"getMemberInfo",args:[myAddress],chainId:CHAIN_ID,enabled:!!myAddress});
  const config=parseConfig(configRaw);
  if(!info||!config)return(<div className="k-pool-card"><div className="k-pool-accent" style={{background:T.border}}/><div className="k-pool-body k-loading"><Loader size={13}/> Loading...</div></div>);
  const[memberCount,round,status]=info;
  const sNum=Number(status),max=Number(config.maxMembers);
  const prog=max>0?(sNum===1?Number(round)/max:Number(memberCount)/max):0;
  return(
    <div className="k-pool-card" onClick={()=>onSelect(poolAddress)}>
      <div className="k-pool-accent" style={{background:accentColor(sNum,T)}}/>
      <div className="k-pool-body">
        <div className="k-pool-head"><div className="k-pool-addr">{shortAddr(poolAddress)}</div>{statusBadge(sNum)}</div>
        <div className="k-pool-lbl">Monthly contribution</div>
        <div className="k-pool-amt">{fmtUSDC(config.monthlyAmount)}</div>
        <div className="k-pool-meta">
          <div className="k-pool-mi"><Users/>{Number(memberCount)}/{max}</div>
          {sNum===1&&<div className="k-pool-mi"><Zap/>Rd {Number(round)}/{max}</div>}
          {sNum===0&&<div className="k-pool-mi"><Clock/>{max-Number(memberCount)} left</div>}
        </div>
        <div className="k-prog"><div className="k-prog-fill" style={{width:`${prog*100}%`,background:accentColor(sNum,T)}}/></div>
        {myMember?.isActive&&<div className="k-member-tag"><CheckCircle size={11}/> You are a member</div>}
      </div>
    </div>
  );
}

function PoolDetail({poolAddress,myAddress,onBack,toast}){
  const{dark}=useTheme(); const T=dark?DARK:LIGHT;
  const[tab,setTab]=useState("info");
  const{data:info,refetch:ri}=useReadContract({address:poolAddress,abi:POOL_ABI,functionName:"getPoolInfo",chainId:CHAIN_ID,watch:true});
  const{data:configRaw}=useReadContract({address:poolAddress,abi:POOL_ABI,functionName:"config",chainId:CHAIN_ID});
  const{data:myMember,refetch:rm}=useReadContract({address:poolAddress,abi:POOL_ABI,functionName:"getMemberInfo",chainId:CHAIN_ID,args:[myAddress]});
  const{data:spots}=useReadContract({address:poolAddress,abi:POOL_ABI,functionName:"spotsRemaining",chainId:CHAIN_ID,watch:true});
  const config=parseConfig(configRaw);
  const USDC_ADDR=ADDRESSES.usdc||"0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582";
  const USDC_ABI=[{name:"approve",type:"function",inputs:[{name:"spender",type:"address"},{name:"amount",type:"uint256"}],outputs:[{type:"bool"}],stateMutability:"nonpayable"}];
  const{writeContract:doApprove,data:approveHash,isPending:approvePending}=useWriteContract();
  const{writeContract:doJoin,data:joinHash,isPending:joinPending}=useWriteContract();
  const{writeContract:doContribute,data:contribHash,isPending:contribPending}=useWriteContract();
  const{isSuccess:approveOk}=useWaitForTransactionReceipt({hash:approveHash});
  const{isSuccess:joinOk}=useWaitForTransactionReceipt({hash:joinHash});
  const{isSuccess:contribOk}=useWaitForTransactionReceipt({hash:contribHash});
  const[pendingAction,setPendingAction]=useState(null);
  useEffect(()=>{
    if(!approveOk||!config)return;
    if(pendingAction==="join"){doJoin({address:poolAddress,abi:POOL_ABI,functionName:"joinPool"});toast("Step 2/2: Joining pool...");}
    if(pendingAction==="contribute"){doContribute({address:poolAddress,abi:POOL_ABI,functionName:"contribute"});toast("Step 2/2: Sending contribution...");}
  },[approveOk]);
  useEffect(()=>{
    if(joinOk){toast("Joined — collateral locked on chain.");rm();ri();setPendingAction(null);}
    if(contribOk){toast("Contribution confirmed.");rm();ri();setPendingAction(null);}
  },[joinOk,contribOk]);
  if(!info||!config)return <div className="k-loading"><Loader size={14}/> Loading pool...</div>;
  const[memberCount,round,status]=info;
  const sNum=Number(status),max=Number(config.maxMembers);
  const collateral=config.monthlyAmount*BigInt(max)*BigInt(config.collateralBps)/10000n;
  const canJoin=sNum===0&&!myMember?.isActive;
  const canPay=sNum===1&&myMember?.isActive&&!myMember?.hasPaid;
  const anyPending=approvePending||joinPending||contribPending;
  const handleJoin=()=>{setPendingAction("join");doApprove({address:USDC_ADDR,abi:USDC_ABI,functionName:"approve",args:[poolAddress,collateral]});toast("Step 1/2: Approving USDC...");};
  const handleContribute=()=>{setPendingAction("contribute");doApprove({address:USDC_ADDR,abi:USDC_ABI,functionName:"approve",args:[poolAddress,config.monthlyAmount]});toast("Step 1/2: Approving USDC...");};
  return(
    <div className="k-page">
      <button className="k-back" onClick={onBack}><ArrowLeft size={13}/> Back to pools</button>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
        <div>
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:6}}>
            <div className="k-page-title" style={{fontSize:19}}>{shortAddr(poolAddress)}</div>{statusBadge(sNum)}
          </div>
          <div className="k-page-sub">{Number(memberCount)}/{max} members · Round {Number(round)}</div>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:T.muted,marginTop:4}}>{poolAddress}</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <ThemeToggle/>
          {canJoin&&<button className="k-btn k-btn-green" onClick={handleJoin} disabled={anyPending}>{anyPending?<><Loader size={13}/>Processing...</>:<><Plus size={13}/>Join Pool</>}</button>}
          {canPay&&<button className="k-btn k-btn-green" onClick={handleContribute} disabled={anyPending}>{anyPending?<><Loader size={13}/>Processing...</>:<><Zap size={13}/>Pay {fmtUSDC(config.monthlyAmount)}</>}</button>}
        </div>
      </div>
      {anyPending&&<div className="k-pending"><Loader size={13}/> Transaction pending — confirm in MetaMask</div>}
      <div className="k-tabs">
        {["info","your status"].map(t=>(
          <button key={t} className={`k-tab ${tab===t?"active":""}`} onClick={()=>setTab(t)} style={{textTransform:"capitalize"}}>{t}</button>
        ))}
      </div>
      {tab==="info"&&(
        <div className="k-card">
          {[["Monthly Contribution",fmtUSDC(config.monthlyAmount)],["Total Pool per Round",fmtUSDC(config.monthlyAmount*BigInt(max))],["Total Cycle Value",fmtUSDC(config.monthlyAmount*BigInt(max)*BigInt(max))],["Collateral Required",`${Number(config.collateralBps)/100}% = ${fmtUSDC(collateral)}`],["Contribution Window",`${Number(config.contributionWindow)} hours`],["Platform Fee",`${Number(config.platformFeeBps)/100}%`],["Current Round",`${Number(round)} of ${max}`],["Status",STATUS[sNum]||"Unknown"],["Spots Remaining",`${Number(spots||0)}`]].map(([k,v],i)=>(
            <div className="k-ir" key={i}><span className="k-ik">{k}</span><span className="k-iv">{v}</span></div>
          ))}
          <div className="k-ab">
            <span style={{flex:1}}>{poolAddress}</span>
            <button onClick={()=>{navigator.clipboard.writeText(poolAddress);toast("Copied.");}}><Copy size={12}/></button>
            <a href={`https://amoy.polygonscan.com/address/${poolAddress}`} target="_blank" rel="noreferrer"><ExternalLink size={12}/></a>
          </div>
        </div>
      )}
      {tab==="your status"&&(
        <div className="k-card">
          {myMember?.isActive?[["Active Member","Yes"],["Paid This Round",myMember.hasPaid?"Yes":"Not yet"],["Received Payout",myMember.hasReceivedPayout?"Yes":"Not yet"],["Rotation Position",myMember.rotationPosition>0?`#${Number(myMember.rotationPosition)}`:"Pending VRF draw"],["Collateral Locked",fmtUSDC(myMember.collateral)],["Total Contributed",fmtUSDC(myMember.totalContributed)]].map(([k,v],i)=>(
            <div className="k-ir" key={i}><span className="k-ik">{k}</span><span className="k-iv">{v}</span></div>
          )):(
            <div className="k-empty">
              <div className="k-empty-icon"><Users size={18} color={T.muted}/></div>
              <p style={{fontSize:13,marginBottom:14}}>You are not a member of this pool.</p>
              {canJoin&&<button className="k-btn k-btn-green" onClick={handleJoin}><Plus size={13}/> Join Pool</button>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Sidebar({page,setPage,address,maticFmt,disconnect}){
  const items=[{id:"dashboard",label:"Dashboard",icon:<BarChart2/>},{id:"my-pools",label:"My Pools",icon:<Users/>},{id:"browse",label:"Browse Pools",icon:<TrendingUp/>},{id:"create",label:"Create Pool",icon:<Plus/>},{id:"profile",label:"Profile",icon:<Award/>}];
  return(
    <aside className="k-sidebar">
      <div className="k-logo-wrap">
        <div className="k-logo-inner">
          <div className="k-logo-icon">K</div>
          <div><div className="k-logo-name">Kameti</div><div className="k-logo-tag">Blockchain</div></div>
        </div>
        <ThemeToggle/>
      </div>
      <nav className="k-nav">
        <div className="k-nav-label">Menu</div>
        {items.map(n=>(
          <button key={n.id} className={`k-nav-item ${page===n.id?"active":""}`} onClick={()=>setPage(n.id)}>{n.icon}{n.label}</button>
        ))}
      </nav>
      <div className="k-wallet-box">
        <div className="k-wallet-card">
          <div className="k-wallet-lbl">Connected wallet</div>
          <div className="k-wallet-addr">{shortAddr(address)}</div>
          <div className="k-wallet-bal">{maticFmt} MATIC</div>
        </div>
        <div style={{marginBottom:6}}><span className="k-pill"><span className="k-pill-dot"/> Polygon Amoy · Testnet</span></div>
        <button className="k-disconnect" onClick={()=>disconnect()}><LogOut size={13}/> Disconnect</button>
      </div>
    </aside>
  );
}

export default function App(){
  const[dark,setDark]=useState(true);
  const T=dark?DARK:LIGHT;
  const toggleTheme=()=>setDark(d=>!d);
  const{address,isConnected}=useAccount();
  const{connect,connectors}=useConnect();
  const{disconnect}=useDisconnect();
  const[page,setPage]=useState("dashboard");
  const[selectedPool,setSelectedPool]=useState(null);
  const[notif,setNotif]=useState(null);
  const[cf,setCf]=useState({monthly:"",members:"",collateral:"20",window:"120"});
  const toast=(msg)=>{setNotif(msg);setTimeout(()=>setNotif(null),4000);};

  // ALL READS WITH chainId: CHAIN_ID — fixes MATIC balance and pool loading
  const{data:maticBalance}=useBalance({address,chainId:CHAIN_ID,watch:true});
  const{data:kmtiBalance}=useReadContract({address:ADDRESSES.token,abi:TOKEN_ABI,functionName:"balanceOf",args:[address],chainId:CHAIN_ID,enabled:!!address,watch:true});
  const{data:creditScore}=useReadContract({address:ADDRESSES.token,abi:TOKEN_ABI,functionName:"creditScore",args:[address],chainId:CHAIN_ID,enabled:!!address});
  const{data:cyclesDone}=useReadContract({address:ADDRESSES.token,abi:TOKEN_ABI,functionName:"cyclesCompleted",args:[address],chainId:CHAIN_ID,enabled:!!address});
  const{data:allPools,refetch:refetchPools}=useReadContract({address:ADDRESSES.factory,abi:FACTORY_ABI,functionName:"getAllPools",chainId:CHAIN_ID,watch:true});
  const{data:totalPools}=useReadContract({address:ADDRESSES.factory,abi:FACTORY_ABI,functionName:"getTotalPools",chainId:CHAIN_ID,watch:true});

  const{writeContract:doCreate,data:createHash,isPending:createPending}=useWriteContract();
  const{isSuccess:createOk}=useWaitForTransactionReceipt({hash:createHash});
  useEffect(()=>{
    if(createOk){toast("Pool deployed on Polygon Amoy.");refetchPools();setPage("browse");setCf({monthly:"",members:"",collateral:"20",window:"120"});}
  },[createOk]);

  const maticFmt=maticBalance?Number(formatUnits(maticBalance.value,18)).toFixed(4):"0.0000";
  const kmtiFmt=kmtiBalance?Number(formatUnits(kmtiBalance,18)).toLocaleString("en-IN"):"0";
  const scoreNum=Number(creditScore||0n);
  const cyclesNum=Number(cyclesDone||0n);
  const totalNum=Number(totalPools||0n);
  const pools=allPools||[];
  const walletIcons={MetaMask:"🦊","Trust Wallet":"🛡️",WalletConnect:"🔗",Coinbase:"🔵",Rainbow:"🌈",Injected:"💼"};
  const globalStyle=makeCSS(T);

  if(!isConnected)return(
    <ThemeCtx.Provider value={{dark,toggle:toggleTheme}}>
      <style>{globalStyle}</style>
      {notif&&<div className="k-notif"><CheckCircle size={13} color={T.green}/> {notif}</div>}
      <div className="k-cs">
        <div className="k-cs-tgl"><ThemeToggle/></div>
        <div className="k-cc">
          <div className="k-cc-logo"><div className="k-cc-icon">K</div><div className="k-cc-name">Kameti</div></div>
          <div className="k-cc-sub">Blockchain · Polygon Amoy</div>
          <p className="k-cc-desc">A rotating savings circle for people who already trust each other — Punjabi families, diaspora communities, chit-fund groups. No organiser. No missing money. Just code.</p>
          {connectors.length>0?connectors.map(c=>(<button key={c.uid} className="k-wo" onClick={()=>{connect({connector:c});toast("Connecting...");}}><span className="k-we">{walletIcons[c.name]||"💼"}</span><span>{c.name}</span></button>)):<p style={{fontSize:13,color:T.muted}}>No wallets detected. Please install MetaMask.</p>}
          <p className="k-cc-note">Polygon Amoy Testnet · No real funds at risk</p>
        </div>
      </div>
    </ThemeCtx.Provider>
  );

  if(page==="detail"&&selectedPool)return(
    <ThemeCtx.Provider value={{dark,toggle:toggleTheme}}>
      <style>{globalStyle}</style>
      {notif&&<div className="k-notif"><CheckCircle size={13} color={T.green}/> {notif}</div>}
      <div className="k-app">
        <Sidebar page="my-pools" setPage={setPage} address={address} maticFmt={maticFmt} disconnect={disconnect}/>
        <main className="k-main"><PoolDetail poolAddress={selectedPool} myAddress={address} onBack={()=>setPage("browse")} toast={toast}/></main>
      </div>
    </ThemeCtx.Provider>
  );

  const renderDashboard=()=>(
    <div className="k-page">
      <div className="k-ticker"><div className="k-ticker-inner">{[...TICKER,...TICKER].map((t,i)=>(<div className="k-ticker-item" key={i}>{i%TICKER.length!==0&&<span className="k-ticker-dot"/>}{t}</div>))}</div></div>
      <div className="k-ph"><span className="k-eyebrow">// Overview</span><div className="k-page-title">Dashboard</div><div className="k-page-sub">Welcome back, {shortAddr(address)}</div></div>
      <div className="k-stats">
        {[{label:"TOTAL POOLS",value:totalNum,sub:"on Amoy testnet"},{label:"YOUR CYCLES",value:cyclesNum,sub:"completed"},{label:"KMTI BALANCE",value:kmtiFmt,sub:"governance tokens"},{label:"CREDIT SCORE",value:`${scoreNum}/1000`,sub:"on-chain reputation",accent:true}].map((s,i)=>(
          <div className="k-stat" key={i}><div className="k-stat-lbl">{s.label}</div><div className={`k-stat-val ${s.accent?"accent":""}`}>{s.value}</div><div className="k-stat-sub">{s.sub}</div></div>
        ))}
      </div>
      <div className="k-banner">
        <div className="k-banner-icon"><TrendingUp size={16} color={T.green}/></div>
        <div><div className="k-banner-title">Contracts live on Polygon Amoy</div><div className="k-banner-sub">KametiToken · KametiFactory · KametiYield deployed</div></div>
        <div className="k-banner-val">{totalNum} Pool{totalNum!==1?"s":""}</div>
      </div>
      <div>
        <div className="k-sec-hd"><span className="k-sec-t">All Pools</span><button className="k-btn k-btn-ghost k-btn-sm" onClick={()=>setPage("browse")}>View all <ChevronRight size={12}/></button></div>
        {pools.length===0?(
          <div className="k-card k-empty"><div className="k-empty-icon"><Users size={18} color={T.muted}/></div><p style={{fontSize:13,marginBottom:14}}>No pools yet — be the first.</p><button className="k-btn k-btn-green" onClick={()=>setPage("create")}><Plus size={13}/> Create First Pool</button></div>
        ):(
          <div className="k-pool-grid">{pools.slice(0,4).map(a=>(<PoolCard key={a} poolAddress={a} myAddress={address} onSelect={a=>{setSelectedPool(a);setPage("detail");}}/>))}</div>
        )}
      </div>
    </div>
  );

  const renderBrowse=()=>(
    <div className="k-page">
      <div className="k-ph"><span className="k-eyebrow">// Explore</span>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div><div className="k-page-title">Browse Pools</div><div className="k-page-sub">{totalNum} pool{totalNum!==1?"s":""} on Amoy testnet</div></div>
          <button className="k-btn k-btn-green" onClick={()=>setPage("create")}><Plus size={13}/> Create Pool</button>
        </div>
      </div>
      {pools.length===0?(
        <div className="k-card k-empty"><div className="k-empty-icon"><Users size={18} color={T.muted}/></div><p style={{fontSize:13,marginBottom:14}}>No pools yet.</p><button className="k-btn k-btn-green" onClick={()=>setPage("create")}><Plus size={13}/> Create First Pool</button></div>
      ):(
        <div className="k-pool-grid">{pools.map(a=>(<PoolCard key={a} poolAddress={a} myAddress={address} onSelect={a=>{setSelectedPool(a);setPage("detail");}}/>))}</div>
      )}
    </div>
  );

  const renderMyPools=()=>(
    <div className="k-page">
      <div className="k-ph"><span className="k-eyebrow">// Your circles</span><div className="k-page-title">My Pools</div><div className="k-page-sub">All pools on Amoy testnet</div></div>
      {pools.length===0?(
        <div className="k-card k-empty"><div className="k-empty-icon"><Users size={18} color={T.muted}/></div><p style={{fontSize:13,marginBottom:14}}>No pools yet.</p><button className="k-btn k-btn-green" onClick={()=>setPage("browse")}>Browse Pools</button></div>
      ):(
        <div className="k-pool-grid">{pools.map(a=>(<PoolCard key={a} poolAddress={a} myAddress={address} onSelect={a=>{setSelectedPool(a);setPage("detail");}}/>))}</div>
      )}
    </div>
  );

  const handleCreate=()=>{
    if(!cf.monthly||!cf.members){toast("Fill all required fields.");return;}
    doCreate({address:ADDRESSES.factory,abi:FACTORY_ABI,functionName:"createPool",args:[parseUnits(cf.monthly,6),BigInt(cf.members),BigInt(Number(cf.collateral)*100),BigInt(cf.window),100n]});
  };

  const renderCreate=()=>(
    <div className="k-page">
      <button className="k-back" onClick={()=>setPage("browse")}><ArrowLeft size={13}/> Back</button>
      <div className="k-ph"><span className="k-eyebrow">// New circle</span><div className="k-page-title">Create Pool</div><div className="k-page-sub">Deploy a KametiPool smart contract on Polygon Amoy</div></div>
      <div className="k-card" style={{maxWidth:540}}>
        {createPending&&<div className="k-pending"><Loader size={13}/> Deploying — confirm in MetaMask...</div>}
        <div className="k-fr">
          <div className="k-fg"><label className="k-fl">Monthly Amount (USDC)</label><input className="k-inp" type="number" placeholder="e.g. 5000" value={cf.monthly} onChange={e=>setCf(f=>({...f,monthly:e.target.value}))}/><div className="k-fh">Per member per month</div></div>
          <div className="k-fg"><label className="k-fl">Max Members</label><input className="k-inp" type="number" placeholder="e.g. 10" min="2" max="100" value={cf.members} onChange={e=>setCf(f=>({...f,members:e.target.value}))}/><div className="k-fh">Between 2 and 100</div></div>
        </div>
        <div className="k-fr">
          <div className="k-fg"><label className="k-fl">Collateral %</label><input className="k-inp" type="number" placeholder="20" value={cf.collateral} onChange={e=>setCf(f=>({...f,collateral:e.target.value}))}/><div className="k-fh">Max 50%</div></div>
          <div className="k-fg"><label className="k-fl">Window (hours)</label><input className="k-inp" type="number" placeholder="120" value={cf.window} onChange={e=>setCf(f=>({...f,window:e.target.value}))}/><div className="k-fh">Min 24 hours</div></div>
        </div>
        {cf.monthly&&cf.members&&(
          <div className="k-sum"><span className="k-eyebrow">// Pool summary</span><div className="k-sum-grid">{[["Pot per round",fmtINR(cf.monthly*cf.members)],["Total cycle",fmtINR(cf.monthly*cf.members*cf.members)],["Collateral/member",fmtINR(cf.monthly*cf.members*cf.collateral/100)],["Est. yield (8%)",fmtINR(Math.round(cf.monthly*cf.members*0.08*cf.members/12))]].map(([k,v],i)=>(<div key={i}><div className="k-sk">{k}</div><div className="k-sv">{v}</div></div>))}</div></div>
        )}
        <div style={{display:"flex",gap:10}}>
          <button className="k-btn k-btn-ghost" onClick={()=>setPage("browse")}>Cancel</button>
          <button className="k-btn k-btn-green" onClick={handleCreate} disabled={createPending}>{createPending?<><Loader size={13}/> Deploying...</>:<><Plus size={13}/> Deploy Pool Contract</>}</button>
        </div>
      </div>
    </div>
  );

  const renderProfile=()=>(
    <div className="k-page">
      <div className="k-ph"><span className="k-eyebrow">// Account</span><div className="k-page-title">Profile</div><div className="k-page-sub">On-chain identity and credit score</div></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div>
          <div className="k-card" style={{marginBottom:14}}>
            <span className="k-eyebrow">Wallet</span>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10.5,color:T.mutedUp,wordBreak:"break-all",margin:"10px 0 3px"}}>{address}</div>
            <div style={{fontSize:11,color:T.muted,marginBottom:14}}>Polygon Amoy Testnet</div>
            {[["MATIC",`${maticFmt} MATIC`],["KMTI",`${kmtiFmt} KMTI`],["Cycles done",cyclesNum],["Credit score",`${scoreNum} / 1000`]].map(([k,v],i)=>(<div className="k-ir" key={i} style={{fontSize:13}}><span className="k-ik">{k}</span><span className="k-iv">{v}</span></div>))}
            <button className="k-btn k-btn-danger" style={{width:"100%",justifyContent:"center",marginTop:14}} onClick={()=>disconnect()}><LogOut size={13}/> Disconnect</button>
          </div>
          <div className="k-card">
            <span className="k-eyebrow">Deployed contracts</span>
            {[["KametiToken",ADDRESSES.token],["KametiFactory",ADDRESSES.factory],["KametiYield",ADDRESSES.yield]].map(([k,v],i)=>(<div key={i}><div className="k-dn">{k}</div><div className="k-da">{shortAddr(v)}<a href={`https://amoy.polygonscan.com/address/${v}`} target="_blank" rel="noreferrer"><ExternalLink size={11}/></a></div></div>))}
          </div>
        </div>
        <div>
          <div className="k-card" style={{marginBottom:14,textAlign:"center"}}>
            <span className="k-eyebrow" style={{textAlign:"left",display:"block"}}>Credit score</span>
            <div style={{display:"flex",justifyContent:"center",margin:"16px 0 12px"}}>
              <svg viewBox="0 0 120 120" width="130" height="130">
                <circle cx="60" cy="60" r="50" fill="none" stroke={T.surfaceUp} strokeWidth="9"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke={T.green} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${2*Math.PI*50*scoreNum/1000} ${2*Math.PI*50*(1-scoreNum/1000)}`} strokeDashoffset={2*Math.PI*50*0.25}/>
                <text x="60" y="55" textAnchor="middle" fontSize="22" fontWeight="700" fill={T.text} fontFamily="Inter">{scoreNum}</text>
                <text x="60" y="72" textAnchor="middle" fontSize="9.5" fill={T.muted} fontFamily="Inter">/ 1000</text>
              </svg>
            </div>
            <div style={{paddingTop:14,borderTop:`1px solid ${T.border}`,textAlign:"left"}}>
              <div style={{fontSize:11,color:T.muted,marginBottom:7}}>Collateral discount</div>
              <div className="k-prog"><div className="k-prog-fill" style={{width:`${scoreNum/10}%`,background:T.green}}/></div>
              <div style={{fontSize:12,color:T.green,marginTop:6,fontFamily:"'IBM Plex Mono',monospace"}}>{(scoreNum*50/100).toFixed(0)} bps off collateral</div>
            </div>
          </div>
          <div className="k-card">
            <span className="k-eyebrow">Score formula</span>
            {[["Cycles × 50",`${cyclesNum} × 50 = ${cyclesNum*50}`],["KMTI bonus",`+${Math.floor(Number(kmtiBalance||0n)/1e21)}`],["Total",`${scoreNum} / 1000`]].map(([k,v],i)=>(<div className="k-ir" key={i} style={{fontSize:13,marginTop:i===0?10:0}}><span className="k-ik">{k}</span><span className="k-iv" style={{color:i===2?T.green:T.text,fontFamily:"'IBM Plex Mono',monospace"}}>{v}</span></div>))}
          </div>
        </div>
      </div>
    </div>
  );

  return(
    <ThemeCtx.Provider value={{dark,toggle:toggleTheme}}>
      <style>{globalStyle}</style>
      {notif&&<div className="k-notif"><CheckCircle size={13} color={T.green}/> {notif}</div>}
      <div className="k-app">
        <Sidebar page={page} setPage={setPage} address={address} maticFmt={maticFmt} disconnect={disconnect}/>
        <main className="k-main">
          {page==="dashboard"&&renderDashboard()}
          {page==="my-pools"&&renderMyPools()}
          {page==="browse"&&renderBrowse()}
          {page==="create"&&renderCreate()}
          {page==="profile"&&renderProfile()}
        </main>
      </div>
    </ThemeCtx.Provider>
  );
}