/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ScoringWeights } from '../types';
import { Sliders, RefreshCw, BarChart } from 'lucide-react';

interface ScoringRulesProps {
  weights: ScoringWeights;
  onWeightsChange: (newWeights: ScoringWeights) => void;
}

export const ScoringRules: React.FC<ScoringRulesProps> = ({ weights, onWeightsChange }) => {
  const handleSliderChange = (key: keyof ScoringWeights, val: number) => {
    onWeightsChange({
      ...weights,
      [key]: parseFloat(val.toFixed(2)),
    });
  };

  const handleReset = () => {
    onWeightsChange({
      volumeSpikeWeight: 0.40,
      priceChangeWeight: 0.20,
      diiBuyWeight: 0.30,
      imbalanceWeight: 0.30,
    });
  };

  return (
    <div className="bg-[#0a0a0a] rounded-xl p-5 border border-white/10 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sliders className="h-4 w-4 text-emerald-400" />
          ENSA Weighted Scoring Model
        </h3>
        <button
          onClick={handleReset}
          className="text-xs text-slate-450 hover:text-white flex items-center gap-1 cursor-pointer transition-colors hover:underline decoration-emerald-500/50"
        >
          <RefreshCw className="h-3 w-3 text-emerald-500" />
          Reset Weights
        </button>
      </div>

      <p className="text-xs text-slate-400 mb-5 leading-relaxed">
        Composite signal scoring integrates multiple market depth & volume forces. Drag sliders to adjust weight distribution.
      </p>

      {/* Scoring weights grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Weight 1: Vol Spike */}
        <div className="bg-white/5 p-3.5 rounded-lg border border-white/10">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-350">Vol Spike Weight (w₁)</span>
            <span className="font-bold font-mono text-emerald-400">{weights.volumeSpikeWeight.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={weights.volumeSpikeWeight}
            onChange={(e) => handleSliderChange('volumeSpikeWeight', parseFloat(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="text-[10px] text-slate-500 mt-1">Multiplier for (Volume / 20D Average)</div>
        </div>

        {/* Weight 2: Price Change */}
        <div className="bg-white/5 p-3.5 rounded-lg border border-white/10">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-350">Price Change Weight (w₂)</span>
            <span className="font-bold font-mono text-emerald-400">{weights.priceChangeWeight.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={weights.priceChangeWeight}
            onChange={(e) => handleSliderChange('priceChangeWeight', parseFloat(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="text-[10px] text-slate-500 mt-1">Multiplier for daily price return %</div>
        </div>

        {/* Weight 3: Institutional Inflow */}
        <div className="bg-white/5 p-3.5 rounded-lg border border-white/10">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-350">DII Bulk Buy Weight (w₃)</span>
            <span className="font-bold font-mono text-emerald-400">{weights.diiBuyWeight.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={weights.diiBuyWeight}
            onChange={(e) => handleSliderChange('diiBuyWeight', parseFloat(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="text-[10px] text-slate-500 mt-1">Multiplier for log(1 + DII buy Crore)</div>
        </div>

        {/* Weight 4: Bid-Ask Imbalance */}
        <div className="bg-white/5 p-3.5 rounded-lg border border-white/10">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-350">Imbalance Weight (w₄)</span>
            <span className="font-bold font-mono text-emerald-400">{weights.imbalanceWeight.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={weights.imbalanceWeight}
            onChange={(e) => handleSliderChange('imbalanceWeight', parseFloat(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="text-[10px] text-slate-500 mt-1">Multiplier for Top 5 Bid-Ask ratio</div>
        </div>
      </div>

      <div className="mt-4 p-2.5 bg-white/5 rounded border border-white/10 flex items-center gap-2">
        <BarChart className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
        <span className="text-[11px] text-slate-400 font-mono">
          Applied Scoring Formula: <code className="text-emerald-300 font-bold bg-black/45 px-1.5 py-0.5 rounded border border-white/5">Score = (w₁ × Vol_Spike) + (w₂ × Price_Pct) + (w₃ × log10(1 + DII_Cr)) + (w₄ × Book_Imbalance)</code>
        </span>
      </div>
    </div>
  );
};
