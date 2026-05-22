/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Stock, ShareholdingTrend } from '../types';
import { REGULATION_31_EXAMPLES } from '../data';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Eye, Layers, TrendingUp, BookOpen, Star, Sparkles } from 'lucide-react';

interface DetailPanelProps {
  stock: Stock | null;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({ stock }) => {
  if (!stock) {
    return (
      <div className="bg-[#0a0a0a] rounded-xl border border-white/10 p-8 text-center text-slate-500 font-medium flex flex-col justify-center items-center h-full min-h-[400px]">
        <Eye className="h-10 w-10 text-slate-605 mb-2" />
        <p className="text-sm">Select a stock from the screener table to analyze depth, filings, and institutional buy metrics.</p>
      </div>
    );
  }

  // Generate 5 levels of realistic L2 depth dynamically based on LTP and current buySellImbalance
  const orderBookRows = useMemo(() => {
    const ltp = stock.lastPrice;
    const isHighBuy = stock.buySellImbalance > 0.15;
    const isHighSell = stock.buySellImbalance < -0.15;

    // Generate spread
    const tickSize = ltp > 1000 ? 0.5 : ltp > 100 ? 0.1 : 0.05;

    const rows = [];
    for (let i = 0; i < 5; i++) {
      // Bids (Buy orders) - just below LTP
      const bidPrice = ltp - (i + 1) * tickSize;
      let bidQty = Math.floor((stock.orderBookBuyQty / 5) * (0.6 + Math.random() * 0.8));
      if (isHighBuy) bidQty = Math.floor(bidQty * 1.5); // inflate because of buy pressure
      const bidOrders = Math.max(1, Math.floor(bidQty / (50 + Math.random() * 200)));

      // Asks (Sell orders) - just above LTP
      const askPrice = ltp + (i + 1) * tickSize;
      let askQty = Math.floor((stock.orderBookSellQty / 5) * (0.6 + Math.random() * 0.8));
      if (isHighSell) askQty = Math.floor(askQty * 1.5);
      const askOrders = Math.max(1, Math.floor(askQty / (50 + Math.random() * 200)));

      rows.push({
        bidPrice: Number(bidPrice.toFixed(2)),
        bidQty,
        bidOrders,
        askPrice: Number(askPrice.toFixed(2)),
        askQty,
        askOrders,
      });
    }

    return rows;
  }, [stock]);

  // Retrieve or generate Regulation 31 Quarterly holding trends
  const quarterlyTrendData: ShareholdingTrend[] = useMemo(() => {
    const defaultData = REGULATION_31_EXAMPLES[stock.symbol as keyof typeof REGULATION_31_EXAMPLES];
    if (defaultData) {
      return defaultData;
    }

    // fallback generator for any newly added or active symbol
    const promoter = stock.promoterStake;
    const fii = stock.fiiStake;
    const dii = stock.diiStake;
    const retail = 100 - promoter - fii - dii;

    const quarters = ["Q1-2025", "Q2-2025", "Q3-2025", "Q4-2025", "Q1-2026"];
    return quarters.map((q, idx) => {
      const qOffset = (idx - 4) * 0.25; // simulate tiny changes backwards
      return {
        quarter: q,
        promoter: Number((promoter - qOffset * 0.1).toFixed(2)),
        fii: Number((fii - qOffset * 0.4).toFixed(2)),
        dii: Number((dii + qOffset * 0.5).toFixed(2)), // show DII increasing!
        retail: Number((retail - qOffset * 0.1).toFixed(2))
      };
    });
  }, [stock]);

  // Max bid/ask qty for depth bar normalization
  const maxQty = useMemo(() => {
    let max = 1;
    orderBookRows.forEach(row => {
      if (row.bidQty > max) max = row.bidQty;
      if (row.askQty > max) max = row.askQty;
    });
    return max;
  }, [orderBookRows]);

  return (
    <div className="bg-[#0a0a0a] rounded-xl border border-white/10 shadow-lg p-5 space-y-6 flex flex-col h-full">
      {/* Stock Overview Banner */}
      <div className="border-b border-white/5 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold font-mono text-white tracking-tight">{stock.symbol}</span>
              <span className="text-xs px-2 py-0.5 bg-white/10 text-slate-300 rounded font-bold font-mono">NSE / BSE</span>
              {stock.diiBuyValueCr > 0 && (
                <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 font-bold rounded flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Inst. Stake Up
                </span>
              )}
            </div>
            <h2 className="text-sm font-semibold text-slate-400 mt-0.5">{stock.companyName}</h2>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold font-mono text-white">
              ₹{stock.lastPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className={`text-xs font-bold font-mono ${stock.pctChange >= 0 ? 'text-emerald-400' : 'text-rose-450'}`}>
              {stock.pctChange >= 0 ? '▲ +' : '▼ '}
              {stock.pctChange.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Basic Stats badges */}
        <div className="mt-3.5 grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/5 p-2 rounded border border-white/5">
            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Volume Spike</span>
            <span className="text-xs font-bold text-white font-mono">{stock.volumeSpikeRatio.toFixed(2)}x</span>
          </div>
          <div className="bg-white/5 p-2 rounded border border-white/5">
            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Order Imbalance</span>
            <span className={`text-xs font-bold font-mono ${stock.buySellImbalance >= 0 ? 'text-emerald-400' : 'text-rose-450'}`}>
              {stock.buySellImbalance >= 0 ? '+' : ''}
              {stock.buySellImbalance.toFixed(2)}
            </span>
          </div>
          <div className="bg-white/5 p-2 rounded border border-white/5">
            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Market Cap (Cr)</span>
            <span className="text-xs font-bold text-white font-mono">₹{Math.floor(stock.marketCapCr / 100).toLocaleString('en-IN')} K</span>
          </div>
        </div>
      </div>

      {/* Level-2 Live Order Book */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-emerald-400" />
          Level-2 Market Depth Feed (Top 5 levels)
        </h3>
        <div className="border border-white/5 rounded-lg overflow-hidden bg-black/35">
          <div className="grid grid-cols-2 text-[10px] font-bold text-slate-400 uppercase py-1 px-3 bg-white/5 border-b border-white/5">
            <div className="flex justify-between border-r border-[#1a1a1a] pr-3">
              <span>Bids (Buy Queue)</span>
              <span>Price</span>
            </div>
            <div className="flex justify-between pl-3">
              <span>Price</span>
              <span>Asks (Sell Queue)</span>
            </div>
          </div>

          <div className="divide-y divide-white/5 font-mono text-xs">
            {orderBookRows.map((row, idx) => {
              const bidDepthPct = (row.bidQty / maxQty) * 100;
              const askDepthPct = (row.askQty / maxQty) * 100;

              return (
                <div key={idx} className="grid grid-cols-2 py-1.5 px-3 relative">
                  
                  {/* Bids Column */}
                  <div className="flex justify-between border-r border-[#1a1a1a] pr-3 relative z-10">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="text-[9px] text-slate-500">({row.bidOrders})</span>
                      {row.bidQty.toLocaleString('en-IN')}
                    </span>
                    <span className="text-slate-300 font-medium">{row.bidPrice.toFixed(2)}</span>
                    <div
                      className="absolute right-[12px] top-0 bottom-0 bg-emerald-500/10 min-w-[20px] transition-all duration-300 z-[-1]"
                      style={{ width: `${bidDepthPct}%` }}
                    />
                  </div>

                  {/* Asks Column */}
                  <div className="flex justify-between pl-3 relative z-10">
                    <span className="text-slate-300 font-medium">{row.askPrice.toFixed(2)}</span>
                    <span className="text-rose-400 font-semibold flex items-center gap-1">
                      {row.askQty.toLocaleString('en-IN')}
                      <span className="text-[9px] text-slate-500">({row.askOrders})</span>
                    </span>
                    <div
                      className="absolute left-[12px] top-0 bottom-0 bg-rose-500/10 min-w-[20px] transition-all duration-300 z-[-1]"
                      style={{ width: `${askDepthPct}%` }}
                    />
                  </div>

                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 text-[10px] font-bold text-slate-350 py-1.5 px-3 bg-white/5 border-t border-white/5">
            <div className="border-r border-[#1a1a1a] pr-3 flex justify-between">
              <span>Total Buy Depth:</span>
              <span>{stock.orderBookBuyQty.toLocaleString('en-IN')}</span>
            </div>
            <div className="pl-3 flex justify-between">
              <span>Total Sell Depth:</span>
              <span>{stock.orderBookSellQty.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Regulation 31 Quarterly filings */}
      <div className="flex-1 flex flex-col min-h-[180px]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
          Shareholding Trends (Regulation 31 Disclosures)
        </h3>
        <div className="text-[10px] text-slate-500 mb-2 font-medium">
          Quarterly reports (5-quarter trend) showing Promoter vs FII vs DII stakes. Notice DII and Mutual Fund changes.
        </div>
        
        <div className="flex-1 select-none min-h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={quarterlyTrendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis dataKey="quarter" stroke="#64748b" fontSize={9} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={9} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, backgroundColor: '#09090b', border: '1px solid #1e293b', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                labelStyle={{ fontWeight: 'bold', color: '#fff' }}
              />
              <Legend verticalAlign="top" iconSize={8} wrapperStyle={{ fontSize: 9, paddingBottom: 10, color: '#f8fafc' }} />
              <Area type="monotone" name="DII (MFS/Ins)" dataKey="dii" stroke="#10b981" fillOpacity={0.12} fill="#10b981" strokeWidth={1.5} />
              <Area type="monotone" name="FII Stake" dataKey="fii" stroke="#60a5fa" fillOpacity={0.06} fill="#60a5fa" strokeWidth={1.5} />
              <Area type="monotone" name="Promoters" dataKey="promoter" stroke="#94a3b8" fillOpacity={0.02} fill="#94a3b8" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
