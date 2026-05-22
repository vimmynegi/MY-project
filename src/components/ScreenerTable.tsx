/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Stock } from '../types';
import { Search, Filter, ShieldAlert, CheckCircle, TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react';

interface ScreenerTableProps {
  stocks: Stock[];
  selectedStockSymbol: string;
  onSelectStock: (stock: Stock) => void;
}

export const ScreenerTable: React.FC<ScreenerTableProps> = ({
  stocks,
  selectedStockSymbol,
  onSelectStock,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [minVolSpike, setMinVolSpike] = useState(1.0);
  const [minImbalance, setMinImbalance] = useState(-1.0); // range is -1 to 1
  const [onlyInstitutional, setOnlyInstitutional] = useState(false);
  const [excludePennyStocks, setExcludePennyStocks] = useState(true); // default true for risk control!

  // Sort columns state
  const [sortBy, setSortBy] = useState<'SCORE' | 'PRICE_CHANGE' | 'SPIKE_RATIO' | 'IMBALANCE'>('SCORE');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Sector list extraction
  const sectors = useMemo(() => {
    const list = new Set(stocks.map(s => s.sector));
    return ['ALL', ...Array.from(list)];
  }, [stocks]);

  // Filter and sort stocks
  const processedStocks = useMemo(() => {
    let result = stocks.filter(stock => {
      // 1. Search term match
      const matchesSearch =
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.companyName.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. Sector match
      const matchesSector = selectedSector === 'ALL' || stock.sector === selectedSector;

      // 3. Vol spike criteria
      const matchesSpike = stock.volumeSpikeRatio >= minVolSpike;

      // 4. Imbalance criteria
      const matchesImbalance = stock.buySellImbalance >= minImbalance;

      // 5. Only Institutional filters
      const matchesInst = !onlyInstitutional || stock.diiBuyValueCr > 0;

      // 6. Exclude penny stocks criteria (Risk filter: price < 60 OR market cap < 15,000 Cr)
      const isPenny = stock.lastPrice < 50 || stock.marketCapCr < 15000;
      const matchesPenny = !excludePennyStocks || !isPenny;

      return matchesSearch && matchesSector && matchesSpike && matchesImbalance && matchesInst && matchesPenny;
    });

    // Sort result
    result.sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (sortBy === 'SCORE') {
        valA = a.signalScore;
        valB = b.signalScore;
      } else if (sortBy === 'PRICE_CHANGE') {
        valA = a.pctChange;
        valB = b.pctChange;
      } else if (sortBy === 'SPIKE_RATIO') {
        valA = a.volumeSpikeRatio;
        valB = b.volumeSpikeRatio;
      } else if (sortBy === 'IMBALANCE') {
        valA = a.buySellImbalance;
        valB = b.buySellImbalance;
      }

      if (sortOrder === 'DESC') {
        return valB - valA;
      } else {
        return valA - valB;
      }
    });

    return result;
  }, [stocks, searchTerm, selectedSector, minVolSpike, minImbalance, onlyInstitutional, excludePennyStocks, sortBy, sortOrder]);

  const toggleSort = (field: 'SCORE' | 'PRICE_CHANGE' | 'SPIKE_RATIO' | 'IMBALANCE') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'DESC' ? 'ASC' : 'DESC');
    } else {
      setSortBy(field);
      setSortOrder('DESC');
    }
  };

  return (
    <div className="bg-[#0a0a0a] rounded-xl border border-white/10 shadow-lg overflow-hidden flex flex-col h-full">
      {/* Filters panel header */}
      <div className="p-4 bg-white/5 border-b border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          
          {/* Search symbol/company */}
          <div className="relative lg:col-span-4">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search Symbol or Company Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-black/45 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Sector selection */}
          <div className="lg:col-span-3">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full bg-black/45 border border-white/10 rounded-lg text-sm px-3 py-1.5 text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="ALL" className="bg-[#0a0a0a]">Sectors: All NSE/BSE</option>
              {sectors.filter(s => s !== 'ALL').map(sector => (
                <option key={sector} value={sector} className="bg-[#0a0a0a]">{sector}</option>
              ))}
            </select>
          </div>

          {/* Spike slide limits */}
          <div className="lg:col-span-5 flex items-center space-x-3">
            <div className="flex-1">
              <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Min Volume Spike: <span className="text-emerald-450 font-mono font-bold">{minVolSpike.toFixed(1)}x</span></span>
              <input
                type="range"
                min="1"
                max="5"
                step="0.2"
                value={minVolSpike}
                onChange={(e) => setMinVolSpike(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Min Imbalance: <span className="text-emerald-450 font-mono font-bold">{minImbalance >= 0 ? '+' : ''}{minImbalance.toFixed(2)}</span></span>
              <input
                type="range"
                min="-0.8"
                max="0.8"
                step="0.1"
                value={minImbalance}
                onChange={(e) => setMinImbalance(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

        </div>

        {/* Toggles filters row */}
        <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap justify-between items-center gap-3">
          <div className="flex space-x-4">
            <label className="inline-flex items-center text-xs text-slate-300 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={onlyInstitutional}
                onChange={(e) => setOnlyInstitutional(e.target.checked)}
                className="rounded mr-1.5 focus:ring-emerald-500 accent-emerald-550"
              />
              Only DII/Mutual Fund Buys
            </label>

            <label className="inline-flex items-center text-xs text-slate-300 font-medium cursor-pointer" title="Exclude penny stocks under ₹50 or cap < ₹15,000 Cr to manage risk.">
              <input
                type="checkbox"
                checked={excludePennyStocks}
                onChange={(e) => setExcludePennyStocks(e.target.checked)}
                className="rounded mr-1.5 focus:ring-rose-500 accent-rose-500"
              />
              <span className="flex items-center gap-1">
                Risk Control (Exclude Penny / Micro-Cap)
              </span>
            </label>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Showing <b className="text-emerald-400 font-mono">{processedStocks.length}</b> of <b className="text-slate-450 font-mono">{stocks.length}</b> tickers
          </div>
        </div>
      </div>

      {/* Grid view */}
      <div className="flex-1 overflow-x-auto min-h-[400px]">
        <table className="min-w-full divide-y divide-white/5 bg-[#050505]/40">
          <thead className="bg-[#050505]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-12">Rank</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Symbol</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">LTP (INR)</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider select-none cursor-pointer hover:bg-white/5 transition-colors" onClick={() => toggleSort('PRICE_CHANGE')}>
                <div className="flex items-center justify-end gap-1">
                  Change %
                  <ArrowUpDown className="h-3 w-3 text-slate-500" />
                </div>
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Volume Today</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider select-none cursor-pointer hover:bg-white/5 transition-colors" onClick={() => toggleSort('SPIKE_RATIO')}>
                <div className="flex items-center justify-end gap-1">
                  Vol Spike
                  <ArrowUpDown className="h-3 w-3 text-slate-500" />
                </div>
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">DII Fresh Buy</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider select-none cursor-pointer hover:bg-white/5 transition-colors" onClick={() => toggleSort('IMBALANCE')}>
                <div className="flex items-center justify-center gap-1">
                  Book Imbalance
                  <ArrowUpDown className="h-3 w-3 text-slate-500" />
                </div>
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider select-none cursor-pointer hover:bg-white/5 transition-colors" onClick={() => toggleSort('SCORE')}>
                <div className="flex items-center justify-end gap-1 text-emerald-400">
                  ENSA Score
                  <ArrowUpDown className="h-3 w-3 text-emerald-500/70" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {processedStocks.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-slate-500 font-medium bg-[#0a0a0a]">
                  No stocks match the screening filters. Adjust slider thresholds or toggle options.
                </td>
              </tr>
            ) : (
              processedStocks.map((stock, index) => {
                const isSelected = stock.symbol === selectedStockSymbol;
                const isVolSpiked = stock.volumeSpikeRatio >= 3.0;
                
                return (
                  <tr
                    key={stock.symbol}
                    onClick={() => onSelectStock(stock)}
                    className={`hover:bg-white/5 cursor-pointer transition-colors ${
                      isSelected ? 'bg-emerald-500/10 border-l-4 border-emerald-500' : 'bg-[#0a0a0a]/35'
                    }`}
                  >
                    {/* Rank */}
                    <td className={`px-4 py-3.5 font-bold font-mono ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {(index + 1).toString().padStart(2, '0')}
                    </td>

                    {/* Symbol & Name */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-white tracking-tight font-mono leading-none">
                        {stock.symbol}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium max-w-[150px] truncate mt-0.5">
                        {stock.companyName}
                      </div>
                      <div className="text-[9px] text-slate-500 italic">
                        {stock.sector}
                      </div>
                    </td>

                    {/* Last Traded Price */}
                    <td className="px-4 py-3.5 text-right font-bold font-mono text-white">
                      ₹{stock.lastPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Change % */}
                    <td className="px-4 py-3.5 text-right font-semibold font-mono">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs leading-none ${
                        stock.pctChange >= 0
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-rose-500/15 text-rose-400'
                      }`}>
                        {stock.pctChange >= 0 ? '+' : ''}{stock.pctChange.toFixed(2)}%
                      </span>
                    </td>

                    {/* Volume */}
                    <td className="px-4 py-3.5 text-right text-xs text-slate-400 font-mono">
                      <div>{stock.volume.toLocaleString('en-IN')}</div>
                      <div className="text-[9px] text-slate-500">Avg 20d: {stock.avgVolume20d.toLocaleString('en-IN')}</div>
                    </td>

                    {/* Volume Spike Ratio */}
                    <td className="px-4 py-3.5 text-right font-mono">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold leading-none ${
                        isVolSpiked
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : stock.volumeSpikeRatio >= 1.5
                          ? 'bg-blue-500/15 text-blue-300'
                          : 'bg-white/5 text-slate-400'
                      }`}>
                        {stock.volumeSpikeRatio.toFixed(2)}x
                      </span>
                    </td>

                    {/* DII Fresh Buy */}
                    <td className="px-4 py-3.5 text-right font-mono text-xs">
                      {stock.diiBuyValueCr > 0 ? (
                        <div>
                          <div className="font-bold text-emerald-400">₹{stock.diiBuyValueCr.toFixed(2)} Cr</div>
                          <div className="text-[9px] text-emerald-300 bg-emerald-500/10 font-semibold px-1 py-0.2 rounded inline-block">Active Buy</div>
                        </div>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    {/* Book Imbalance status bar */}
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex flex-col items-center justify-center max-w-[120px] mx-auto">
                        <div className="w-full bg-[#1e1e1e] h-2.5 rounded-full overflow-hidden flex">
                          {/* Bid fraction */}
                          <div
                            className="bg-emerald-500 h-full animate-pulse"
                            style={{ width: `${Math.max(0, Math.min(100, (stock.buySellImbalance + 1) * 50))}%` }}
                          />
                          {/* Ask fraction */}
                          <div
                            className="bg-rose-500 h-full"
                            style={{ width: `${Math.max(0, Math.min(100, (1 - stock.buySellImbalance) * 50))}%` }}
                          />
                        </div>
                        <span className={`text-[10px] font-bold font-mono mt-1 ${
                          stock.buySellImbalance > 0.2 ? 'text-emerald-400' : stock.buySellImbalance < -0.2 ? 'text-rose-450' : 'text-slate-400'
                        }`}>
                          {stock.buySellImbalance >= 0 ? '+' : ''}{stock.buySellImbalance.toFixed(2)}
                        </span>
                      </div>
                    </td>

                    {/* ENSA Score */}
                    <td className="px-4 py-3.5 text-right">
                      <span className="font-mono font-bold text-white bg-black/45 border border-white/10 px-2.5 py-1 rounded">
                        {stock.signalScore.toFixed(3)}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
