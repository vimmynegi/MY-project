/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StockHistoryItem {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  niftyClose: number;
}

export interface Stock {
  symbol: string;
  companyName: string;
  sector: string;
  lastPrice: number;
  prevClose: number;
  pctChange: number;
  volume: number;
  avgVolume20d: number;
  volumeSpikeRatio: number;
  diiBuyQty: number; // Volume purchased by DII in bulk deals today
  diiBuyValueCr: number; // In Crores INR (1 Crore = 10,000,000)
  orderBookBuyQty: number; // Sum of top 5 ask queues
  orderBookSellQty: number; // Sum of top 5 bid queues
  buySellImbalance: number; // (Buy - Sell)/(Buy + Sell)
  signalScore: number;
  rank: number;
  marketCapCr: number;
  rsi: number;
  isUpperCircuit: boolean;
  history: StockHistoryItem[];
  promoterStake: number; // % holdings
  fiiStake: number; // % holdings
  diiStake: number; // % holdings (Mutual Funds + Insurance)
  mfStakePrevQuarter: number; // for comparison
}

export interface BulkDeal {
  id: string;
  symbol: string;
  date: string;
  clientName: string;
  dealType: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  valueCr: number;
  clientType: 'Mutual Fund' | 'Insurance' | 'FII' | 'Promoter' | 'Retail/Other';
}

export interface OrderBookRow {
  bidPrice: number;
  bidQty: number;
  bidOrders: number;
  askPrice: number;
  askQty: number;
  askOrders: number;
}

export interface ShareholdingTrend {
  quarter: string;
  promoter: number;
  fii: number;
  dii: number;
  retail: number;
}

export interface BacktestTrade {
  symbol: string;
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  returnPct: number;
  status: 'PROFIT' | 'LOSS';
  volumeSpikeAtEntry: number;
  imbalanceAtEntry: number;
  diiAction: string;
}

export interface BacktestResult {
  totalTrades: number;
  winRate: number;
  cumulativeReturn: number;
  benchmarkReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  trades: BacktestTrade[];
  chartData: Array<{
    dayName: string;
    portfolio: number;
    benchmark: number;
  }>;
}

export interface ScoringWeights {
  volumeSpikeWeight: number;
  priceChangeWeight: number;
  diiBuyWeight: number;
  imbalanceWeight: number;
}
