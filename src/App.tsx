/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { generateSimulationData, BULK_DEALS } from './data';
import { Stock, ScoringWeights } from './types';
import { Header } from './components/Header';
import { ScoringRules } from './components/ScoringRules';
import { ScreenerTable } from './components/ScreenerTable';
import { DetailPanel } from './components/DetailPanel';
import { Backtester } from './components/Backtester';
import { AIAnalyst } from './components/AIAnalyst';
import { NotebookTabs, BarChart, History, Users, Layers, Award, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  // 1. Core State
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string>('RELIANCE');
  const [activeTab, setActiveTab] = useState<'SCREENER' | 'BACKTEST' | 'BULK_DEALS'>('SCREENER');

  // Nifty 50 live proxy states
  const [niftyValue, setNiftyValue] = useState(22450.60);
  const [niftyPctChange, setNiftyPctChange] = useState(0.45);

  // Scoring weights parameter state (default setup)
  const [scoringWeights, setScoringWeights] = useState<ScoringWeights>({
    volumeSpikeWeight: 0.40,
    priceChangeWeight: 0.20,
    diiBuyWeight: 0.30,
    imbalanceWeight: 0.30,
  });

  const [isSimulatingLive, setIsSimulatingLive] = useState(true);

  // 2. Initialize stock database on mount
  useEffect(() => {
    const freshData = generateSimulationData();
    setStocks(freshData);
  }, []);

  // 3. Reset helper
  const handleResetSimulation = useCallback(() => {
    const freshData = generateSimulationData();
    setStocks(freshData);
    setNiftyValue(22450.60);
    setNiftyPctChange(0.45);
  }, []);

  // 4. Live Tick Simulation (Periodic update every 2.5 seconds mimicking live NSE socket prices & order book changes)
  useEffect(() => {
    if (!isSimulatingLive) return;

    const interval = setInterval(() => {
      // Small fluctuation in NIFTY 50
      setNiftyValue(prev => {
        const move = (Math.random() - 0.48) * 4.5;
        const newVal = prev + move;
        const initial = 22400.00;
        setNiftyPctChange(((newVal - initial) / initial) * 100);
        return newVal;
      });

      // Select 2 random stocks to receive ticks
      setStocks(prevStocks => {
        if (prevStocks.length === 0) return prevStocks;

        return prevStocks.map(stock => {
          // 25% chance of tick update
          if (Math.random() > 0.25) return stock;

          const tickMovePct = (Math.random() - 0.49) * 0.004; // small tick move
          const newPrice = Number(Math.max(2, stock.lastPrice * (1 + tickMovePct)).toFixed(2));
          const pctChange = Number((((newPrice - stock.prevClose) / stock.prevClose) * 100).toFixed(2));

          // Mock incremental volume addition
          const addedVol = Math.floor(1000 + Math.random() * 8000);
          const newVolume = stock.volume + addedVol;

          // Recompute Spike ratio
          const volSpike = Number((newVolume / stock.avgVolume20d).toFixed(2));

          // Squeezing or adding size to bid-ask depths
          const bookDelta = Math.floor((Math.random() - 0.5) * 5000);
          const newBuyBook = Math.max(1000, stock.orderBookBuyQty + bookDelta);
          const newSellBook = Math.max(1000, stock.orderBookSellQty - bookDelta);
          const imbalance = Number(((newBuyBook - newSellBook) / (newBuyBook + newSellBook)).toFixed(2));

          return {
            ...stock,
            lastPrice: newPrice,
            pctChange,
            volume: newVolume,
            volumeSpikeRatio: volSpike,
            orderBookBuyQty: newBuyBook,
            orderBookSellQty: newSellBook,
            buySellImbalance: imbalance,
          };
        });
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [isSimulatingLive]);

  // 5. Dynamic Recalculating and Sorting of Signal Scores
  const computedStocks = useMemo(() => {
    const rawList = stocks.map(stock => {
      // Score formula combining the adjusted user weights
      // score = (vol_spike * w1) + (pctChange * w2) + (log10(1 + DII_Cr) * w3) + (imbalance * w4)
      const diiInflowFactor = Math.log10(1 + stock.diiBuyValueCr);
      const score = 
        (stock.volumeSpikeRatio * scoringWeights.volumeSpikeWeight) +
        (stock.pctChange * scoringWeights.priceChangeWeight) +
        (diiInflowFactor * scoringWeights.diiBuyWeight) +
        (stock.buySellImbalance * scoringWeights.imbalanceWeight);

      return {
        ...stock,
        signalScore: Number(score.toFixed(3)),
      };
    });

    // Re-sort and assign ranks
    rawList.sort((a, b) => b.signalScore - a.signalScore);
    return rawList.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  }, [stocks, scoringWeights]);

  // Highlight specific selected stock
  const selectedStockObj = useMemo(() => {
    return computedStocks.find(s => s.symbol === selectedStockSymbol) || computedStocks[0] || null;
  }, [computedStocks, selectedStockSymbol]);

  const handleSelectStock = (stock: Stock) => {
    setSelectedStockSymbol(stock.symbol);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col font-sans select-none antialiased text-slate-300">
      {/* 1. Header component */}
      <Header
        niftyValue={niftyValue}
        niftyChange={niftyValue - 22400}
        niftyPctChange={niftyPctChange}
        onResetSimulation={handleResetSimulation}
        isSimulatingLive={isSimulatingLive}
        onToggleLiveSimulation={() => setIsSimulatingLive(!isSimulatingLive)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex-1 flex flex-col space-y-5">
        
        {/* Core Quick scoring parameters card */}
        <ScoringRules
          weights={scoringWeights}
          onWeightsChange={setScoringWeights}
        />

        {/* Tab Navigation Menu */}
        <div className="flex border-b border-white/10">
          <nav className="flex space-x-2" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('SCREENER')}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-lg border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'SCREENER'
                  ? 'border-emerald-500 bg-[#0a0a0a] text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <NotebookTabs className="h-4 w-4" />
              Realtime Screener & L2 Queue
            </button>
            
            <button
              onClick={() => setActiveTab('BACKTEST')}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-lg border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'BACKTEST'
                  ? 'border-emerald-500 bg-[#0a0a0a] text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <History className="h-4 w-4" />
              Quant Backtester
            </button>

            <button
              onClick={() => setActiveTab('BULK_DEALS')}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-lg border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'BULK_DEALS'
                  ? 'border-emerald-500 bg-[#0a0a0a] text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Users className="h-4 w-4" />
              Sponsor Bulk Deals Directory
            </button>
          </nav>
        </div>

        {/* Tab Content Rendering */}
        <div className="flex-1">
          {activeTab === 'SCREENER' ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
              
              {/* Screener list table - spanning 7 columns */}
              <div className="xl:col-span-7 flex flex-col">
                <ScreenerTable
                  stocks={computedStocks}
                  selectedStockSymbol={selectedStockSymbol}
                  onSelectStock={handleSelectStock}
                />
              </div>

              {/* Order Book, Shareholding & AI Insights Panels - spanning 5 columns */}
              <div className="xl:col-span-5 flex flex-col space-y-5">
                {/* L2 and Reg-31 holdings */}
                <DetailPanel stock={selectedStockObj} />
                
                {/* Smart Quant commentary */}
                <AIAnalyst stock={selectedStockObj} />
              </div>

            </div>
          ) : activeTab === 'BACKTEST' ? (
            <Backtester stocks={computedStocks} />
          ) : (
            /* Bulk/Block Deals Directory Board */
            <div className="bg-[#0a0a0a] rounded-xl border border-white/10 shadow-lg p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-400" />
                  Institutional Sponsor Block Deals (NSE & BSE Archives)
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  NSE Bulk Deals registry records block executions exceeding 0.5% of total paid-up equity in a single trading session. We filter this stream for Mutual Funds, LIC and insurance client types to isolate high-conviction accumulation.
                </p>
              </div>

              <div className="border border-white/5 rounded-lg overflow-hidden bg-black/25">
                <table className="min-w-full divide-y divide-white/5 text-xs">
                  <thead className="bg-[#050505]">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-slate-450 uppercase tracking-wider text-[9px]">Symbol</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-450 uppercase tracking-wider text-[9px]">Date</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-450 uppercase tracking-wider text-[9px]">Sponsor/Client Name</th>
                      <th className="px-4 py-3 text-center font-bold text-slate-450 uppercase tracking-wider text-[9px]">Type</th>
                      <th className="px-4 py-3 text-right font-bold text-slate-450 uppercase tracking-wider text-[9px]">Quantity</th>
                      <th className="px-4 py-3 text-right font-bold text-slate-450 uppercase tracking-wider text-[9px]">Price (INR)</th>
                      <th className="px-4 py-3 text-right font-bold text-slate-450 uppercase tracking-wider text-[9px]">Value (Cr)</th>
                      <th className="px-4 py-3 text-center font-bold text-slate-450 uppercase tracking-wider text-[9px]">Client Class</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300 font-mono bg-[#0a0a0a]/35">
                    {BULK_DEALS.map((deal) => (
                      <tr key={deal.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-sans font-bold text-white">{deal.symbol}</td>
                        <td className="px-4 py-3 text-slate-400">{deal.date}</td>
                        <td className="px-4 py-3 text-slate-200 font-sans font-semibold max-w-[240px] truncate">{deal.clientName}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            deal.dealType === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {deal.dealType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">{deal.quantity.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-right">₹{deal.price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-bold text-white">₹{deal.valueCr.toFixed(2)} Cr</td>
                        <td className="px-4 py-3 text-center font-sans font-semibold">
                          <span className="bg-white/10 text-slate-350 px-2 py-0.5 rounded text-[10px]">
                            {deal.clientType}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] border-t border-white/10 mt-12 py-6 text-center text-[11px] text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Exchange-Based Net Stock Analyzer (ENSA). Indian Markets regulatory tracking platform.</p>
          <p className="mt-1 font-mono">Precision parameters calibrated. Built-in compliance checkpoints under SEBI Reg 31 & 33.</p>
        </div>
      </footer>
    </div>
  );
}
