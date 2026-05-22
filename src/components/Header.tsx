/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TrendingUp, Award, RefreshCw, BarChart2, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  niftyValue: number;
  niftyChange: number;
  niftyPctChange: number;
  onResetSimulation: () => void;
  isSimulatingLive: boolean;
  onToggleLiveSimulation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  niftyValue,
  niftyChange,
  niftyPctChange,
  onResetSimulation,
  isSimulatingLive,
  onToggleLiveSimulation,
}) => {
  return (
    <header className="bg-[#0a0a0a] border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Title section */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500 rounded-lg text-black font-bold">
              <BarChart2 className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                ENSA <span className="text-xs px-2 py-0.5 bg-white/10 text-emerald-400 rounded font-normal">v2.4 Indian Markets</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium tracking-wide">Exchange-Based Net Stock Analyzer</p>
            </div>
          </div>

          {/* Markets Index and Breadth Tickers */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-400">NIFTY 50</span>
                <span className="text-sm font-bold font-mono text-white">
                  {niftyValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`text-xs font-bold font-mono flex items-center ${niftyPctChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {niftyPctChange >= 0 ? '+' : ''}
                  {niftyPctChange.toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-500 font-mono text-right">
              <div>Market Status: Live</div>
              <div>Data: NSE/BSE Feed (Delayed)</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleLiveSimulation}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer ${
                isSimulatingLive
                  ? 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30'
                  : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30'
              }`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${isSimulatingLive ? 'bg-rose-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span>{isSimulatingLive ? 'Pause Feed' : 'Start Live Feed'}</span>
            </button>
            
            <button
              onClick={onResetSimulation}
              className="p-2 text-slate-400 hover:bg-white/5 border border-white/10 rounded-lg hover:text-white transition-colors cursor-pointer"
              title="Reset stock databases"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
