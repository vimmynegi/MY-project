/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Stock, BulkDeal, StockHistoryItem } from './types';

// Let's generate a robust 60-day price history for our stocks to simulate backtests nicely
export const STOCKS_INFO = [
  {
    symbol: "RELIANCE",
    companyName: "Reliance Industries Limited",
    sector: "Energy, Oil & Gas",
    basePrice: 2450.00,
    marketCapCr: 1650000,
    promoterStake: 50.39,
    fiiStake: 22.41,
    diiStake: 16.55,
    mfStakePrevQuarter: 15.10, //MF Stake increased!
  },
  {
    symbol: "TCS",
    companyName: "Tata Consultancy Services Ltd",
    sector: "Information Technology",
    basePrice: 3820.00,
    marketCapCr: 1380000,
    promoterStake: 72.41,
    fiiStake: 12.50,
    diiStake: 9.80,
    mfStakePrevQuarter: 9.90, //MF Stake slight decrease
  },
  {
    symbol: "HDFCBANK",
    companyName: "HDFC Bank Limited",
    sector: "Banking & Finance",
    basePrice: 1520.00,
    marketCapCr: 1150000,
    promoterStake: 0.00, // Demerged structure (Promoters 0, public held)
    fiiStake: 47.20,
    diiStake: 32.40,
    mfStakePrevQuarter: 30.15, //MF Stake significantly increased
  },
  {
    symbol: "INFOSYS",
    companyName: "Infosys Limited",
    sector: "Information Technology",
    basePrice: 1410.00,
    marketCapCr: 580000,
    promoterStake: 14.89,
    fiiStake: 33.70,
    diiStake: 35.10,
    mfStakePrevQuarter: 34.20, //MF Stake slight increase
  },
  {
    symbol: "SBIN",
    companyName: "State Bank of India",
    sector: "Public Banking",
    basePrice: 720.00,
    marketCapCr: 640000,
    promoterStake: 57.49,
    fiiStake: 11.20,
    diiStake: 24.80,
    mfStakePrevQuarter: 23.50, //MF Stake increased
  },
  {
    symbol: "ICICIBANK",
    companyName: "ICICI Bank Limited",
    sector: "Banking & Finance",
    basePrice: 1080.00,
    marketCapCr: 750000,
    promoterStake: 0.00,
    fiiStake: 44.50,
    diiStake: 45.10,
    mfStakePrevQuarter: 44.30,
  },
  {
    symbol: "TATAMOTORS",
    companyName: "Tata Motors Limited",
    sector: "Automotive",
    basePrice: 910.00,
    marketCapCr: 330000,
    promoterStake: 41.86,
    fiiStake: 18.20,
    diiStake: 17.50,
    mfStakePrevQuarter: 16.20, //MF Stake increased
  },
  {
    symbol: "ITC",
    companyName: "ITC Limited",
    sector: "FMCG, Conglomerate",
    basePrice: 430.00,
    marketCapCr: 530000,
    promoterStake: 0.00,
    fiiStake: 43.10,
    diiStake: 42.40,
    mfStakePrevQuarter: 42.10,
  },
  {
    symbol: "BHARTIARTL",
    companyName: "Bharti Airtel Limited",
    sector: "Telecommunication",
    basePrice: 1250.00,
    marketCapCr: 710000,
    promoterStake: 54.70,
    fiiStake: 23.90,
    diiStake: 16.40,
    mfStakePrevQuarter: 15.30, //MF Stake increased
  },
  {
    symbol: "COALINDIA",
    companyName: "Coal India Limited",
    sector: "Metals & Mining",
    basePrice: 440.00,
    marketCapCr: 270000,
    promoterStake: 63.13,
    fiiStake: 8.40,
    diiStake: 22.80,
    mfStakePrevQuarter: 21.50,
  },
  {
    symbol: "LTIM",
    companyName: "LTIMindtree Limited",
    sector: "Information Technology",
    basePrice: 4700.00,
    marketCapCr: 140000,
    promoterStake: 68.60,
    fiiStake: 8.10,
    diiStake: 13.90,
    mfStakePrevQuarter: 13.20,
  },
  {
    symbol: "BHEL",
    companyName: "Bharat Heavy Electricals Ltd",
    sector: "Capital Goods / Heavy Indus",
    basePrice: 235.00,
    marketCapCr: 82000,
    promoterStake: 63.17,
    fiiStake: 7.90,
    diiStake: 17.20,
    mfStakePrevQuarter: 14.10, // Significant DII inflow
  },
  {
    symbol: "ZOMATO",
    companyName: "Zomato Limited",
    sector: "Internet & Technology",
    basePrice: 185.00,
    marketCapCr: 161000,
    promoterStake: 0.00,
    fiiStake: 51.20,
    diiStake: 23.40,
    mfStakePrevQuarter: 19.80, // Heavy MF accumulation!
  },
  {
    symbol: "SUZLON",
    companyName: "Suzlon Energy Limited",
    sector: "Renewable Energy",
    basePrice: 52.00,
    marketCapCr: 70000,
    promoterStake: 13.29,
    fiiStake: 19.50,
    diiStake: 14.80,
    mfStakePrevQuarter: 10.90, // Major turnaround MF stake
  },
  {
    symbol: "TATAELXSI",
    companyName: "Tata Elxsi Limited",
    sector: "Engineering & Design",
    basePrice: 7100.00,
    marketCapCr: 44200,
    promoterStake: 43.92,
    fiiStake: 12.10,
    diiStake: 14.30,
    mfStakePrevQuarter: 13.90,
  },
  {
    symbol: "RPOWER",
    companyName: "Reliance Power Limited",
    sector: "Power Generation",
    basePrice: 28.50,
    marketCapCr: 11400,
    promoterStake: 23.15,
    fiiStake: 6.20,
    diiStake: 3.80,
    mfStakePrevQuarter: 3.75, // Tiny MF stake (penny stock)
  }
];

// Helper to generate 60 days of historical data for each stock correlated with NIFTY 50
export const generateSimulationData = (): Stock[] => {
  const numDays = 60;
  const historyData: { [symbol: string]: StockHistoryItem[] } = {};

  // 1. Generate NIFTY 50 base path
  const niftyPath: number[] = [];
  let currentNifty = 22400;
  for (let d = 0; d < numDays; d++) {
    // Generate some interesting trends. Let's make there be a dip in the middle and a rally at the end.
    let change = 0;
    if (d < 15) {
      change = (Math.random() - 0.45) * 120; // slow drift up
    } else if (d >= 15 && d < 35) {
      change = (Math.random() - 0.60) * 150; // correction
    } else if (d >= 35 && d < 55) {
      change = (Math.random() - 0.35) * 180; // sharp rally
    } else {
      change = (Math.random() - 0.4) * 140; // holding high
    }
    currentNifty += change;
    niftyPath.push(currentNifty);
  }

  // 2. Generate stock historical sequences
  return STOCKS_INFO.map((info, stockIdx) => {
    const stockHistory: StockHistoryItem[] = [];
    let currentPrice = info.basePrice;
    
    // Each stock has a specific beta (market sensitivity) and volatility factor
    const beta = info.symbol === "RELIANCE" ? 1.0 :
                 info.symbol === "TCS" ? 0.75 :
                 info.symbol === "HDFCBANK" ? 1.1 :
                 info.symbol === "ZOMATO" ? 1.5 :
                 info.symbol === "SUZLON" ? 1.8 : 
                 info.symbol === "RPOWER" ? 2.5 : 1.2;

    const baseVol = info.symbol === "RELIANCE" ? 2000000 :
                     info.symbol === "TCS" ? 1200000 :
                     info.symbol === "HDFCBANK" ? 3500000 :
                     info.symbol === "SUZLON" ? 35000000 :
                     info.symbol === "RPOWER" ? 45000000 : 800000;

    for (let d = 0; d < numDays; d++) {
      const idx = d;
      const prevNifty = idx > 0 ? niftyPath[idx - 1] : niftyPath[0];
      const currentNiftyVal = niftyPath[idx];
      const niftyPct = (currentNiftyVal - prevNifty) / prevNifty;

      // Volatility shock / idiosyncratic momentum (like a news event)
      let stockShock = (Math.random() - 0.48) * 0.03; // generic drift

      // Let's program dynamic breakout events on specific days to test backtesting signals!
      // Day 38: Volume breakout for Reliance
      if (info.symbol === "RELIANCE" && d === 38) {
        stockShock = 0.048; // +4.8% spike
      }
      // Day 42: Mass DII Buying for Zomato
      if (info.symbol === "ZOMATO" && d === 42) {
        stockShock = 0.085; // +8.5% spike
      }
      // Day 20: Negative Shock for RPOWER
      if (info.symbol === "RPOWER" && d === 20) {
        stockShock = -0.050; // limit down
      }
      // Day 48: Suzlon breakout
      if (info.symbol === "SUZLON" && d === 48) {
        stockShock = 0.091; // +9% spike
      }

      const totalPctChange = (niftyPct * beta) + stockShock;
      const prevClose = currentPrice;
      currentPrice = currentPrice * (1 + totalPctChange);

      // Volume generation: normal day vs. spike day
      let dayVolume = baseVol * (0.6 + Math.random() * 0.8);
      if (info.symbol === "RELIANCE" && d === 38) {
        dayVolume = baseVol * 4.2; // 4.2x volume spike
      }
      if (info.symbol === "ZOMATO" && d === 42) {
        dayVolume = baseVol * 3.8; // 3.8x volume spike
      }
      if (info.symbol === "SUZLON" && d === 48) {
        dayVolume = baseVol * 5.1; // 5.1x volume spike
      }
      if (info.symbol === "HDFCBANK" && d === 45) {
        dayVolume = baseVol * 3.1; // 3.1x volume spike
      }

      stockHistory.push({
        date: `2026-03-${String(1 + Math.floor(d / 2.5)).padStart(2, '0')}`,
        open: prevClose * (1 + (Math.random() - 0.5) * 0.01),
        close: currentPrice,
        high: Math.max(prevClose, currentPrice) * (1 + Math.random() * 0.015),
        low: Math.min(prevClose, currentPrice) * (1 - Math.random() * 0.015),
        volume: Math.floor(dayVolume),
        niftyClose: currentNiftyVal
      });
    }

    // Latest EOD data is Day 59
    const lastDayHistory = stockHistory[numDays - 1];
    const prevDayHistory = stockHistory[numDays - 2];
    const avgVol = Math.floor(
      stockHistory.slice(numDays - 21, numDays - 1).reduce((acc, current) => acc + current.volume, 0) / 20
    );

    const latestVolume = lastDayHistory.volume;
    const spikeRatio = latestVolume / avgVol;

    // Simulate order-book fields for live ticker
    let isUpperCircuit = false;
    let pctChange = ((lastDayHistory.close - prevDayHistory.close) / prevDayHistory.close) * 100;
    if (pctChange > 9.9 && info.symbol === "RPOWER") {
      isUpperCircuit = true;
    }

    // Assign realistic DII buy volumes today (matches with bulk deals simulated below)
    let diiBuyQty = 0;
    let diiBuyValueCr = 0;

    if (info.symbol === "RELIANCE") {
      diiBuyQty = 420000;
      diiBuyValueCr = (diiBuyQty * lastDayHistory.close) / 10000000;
    } else if (info.symbol === "ZOMATO") {
      diiBuyQty = 2400000;
      diiBuyValueCr = (diiBuyQty * lastDayHistory.close) / 10000000;
    } else if (info.symbol === "SUZLON") {
      diiBuyQty = 8500000;
      diiBuyValueCr = (diiBuyQty * lastDayHistory.close) / 10000000;
    } else if (info.symbol === "HDFCBANK") {
      diiBuyQty = 1100000;
      diiBuyValueCr = (diiBuyQty * lastDayHistory.close) / 10000000;
    }

    // Set up default order-book quantities for top-5 aggregate lists
    // Buy depth and sell depth
    let buyDepthBase = 120000;
    let sellDepthBase = 90000;
    
    if (info.symbol === "RELIANCE") {
      buyDepthBase = 580000;
      sellDepthBase = 220000; // heavy buy imbalance! (0.45)
    } else if (info.symbol === "ZOMATO") {
      buyDepthBase = 4500000;
      sellDepthBase = 1800000; // imbalance: (4.5 - 1.8) / 6.3 = 0.428
    } else if (info.symbol === "SUZLON") {
      buyDepthBase = 12400000;
      sellDepthBase = 3200000; // Imbalance: 0.589
    } else if (info.symbol === "RPOWER") {
      buyDepthBase = 800000;
      sellDepthBase = 2200000; // heavy sell concentration
    }

    const buySellImbalance = (buyDepthBase - sellDepthBase) / (buyDepthBase + sellDepthBase);

    // Initial Scoring Formula (Weights: volSpike=0.4, priceChange=0.2, dii=0.3, imbalance=0.3)
    // score = volumeSpikeRatio * 0.4 + pctChange * 0.2 + (diiBuyValueCr * 0.1) * 0.3 + buySellImbalance * 0.3
    const scoreVal = (spikeRatio * 0.4) + (pctChange * 0.2) + (Math.log10(1 + diiBuyValueCr) * 0.3) + (buySellImbalance * 0.3);

    return {
      symbol: info.symbol,
      companyName: info.companyName,
      sector: info.sector,
      lastPrice: Number(lastDayHistory.close.toFixed(2)),
      prevClose: Number(prevDayHistory.close.toFixed(2)),
      pctChange: Number(pctChange.toFixed(2)),
      volume: latestVolume,
      avgVolume20d: avgVol,
      volumeSpikeRatio: Number(spikeRatio.toFixed(2)),
      diiBuyQty,
      diiBuyValueCr: Number(diiBuyValueCr.toFixed(2)),
      orderBookBuyQty: buyDepthBase,
      orderBookSellQty: sellDepthBase,
      buySellImbalance: Number(buySellImbalance.toFixed(2)),
      signalScore: Number(scoreVal.toFixed(3)),
      rank: 1, // Will be computed dynamically after sorting
      marketCapCr: info.marketCapCr,
      rsi: info.symbol === "ZOMATO" || info.symbol === "SUZLON" ? 64 : 52,
      isUpperCircuit,
      history: stockHistory,
      promoterStake: info.promoterStake,
      fiiStake: info.fiiStake,
      diiStake: info.diiStake,
      mfStakePrevQuarter: info.mfStakePrevQuarter,
    };
  });
};

// Static simulated Bulk Deal list for displaying in the dashboard
export const BULK_DEALS: BulkDeal[] = [
  {
    id: "BD-101",
    symbol: "RELIANCE",
    date: "2026-05-21",
    clientName: "SBIN MUTUAL FUND - EQUITY INFLOW FUND",
    dealType: "BUY",
    quantity: 420000,
    price: 2710.45,
    valueCr: 113.83,
    clientType: "Mutual Fund"
  },
  {
    id: "BD-102",
    symbol: "ZOMATO",
    date: "2026-05-21",
    clientName: "HDFC MUTUAL FUND - FLEXI CAP REGULAR",
    dealType: "BUY",
    quantity: 2400000,
    price: 198.50,
    valueCr: 47.64,
    clientType: "Mutual Fund"
  },
  {
    id: "BD-103",
    symbol: "SUZLON",
    date: "2026-05-21",
    clientName: "LIFE INSURANCE CORPORATION OF INDIA (LIC)",
    dealType: "BUY",
    quantity: 8500000,
    price: 54.10,
    valueCr: 45.98,
    clientType: "Insurance"
  },
  {
    id: "BD-104",
    symbol: "HDFCBANK",
    date: "2026-05-21",
    clientName: "NIPPON INDIA MUTUAL FUND - GROWTH STABLE",
    dealType: "BUY",
    quantity: 1100000,
    price: 1545.00,
    valueCr: 169.95,
    clientType: "Mutual Fund"
  },
  {
    id: "BD-105",
    symbol: "TCS",
    date: "2026-05-20",
    clientName: "SOCIETE GENERALE - MULTI SHARE ACCT",
    dealType: "SELL",
    quantity: 350000,
    price: 3840.10,
    valueCr: 134.40,
    clientType: "FII"
  },
  {
    id: "BD-106",
    symbol: "BHEL",
    date: "2026-05-19",
    clientName: "SBI MUTUAL FUND - CONTRA DIRECT",
    dealType: "BUY",
    quantity: 3800000,
    price: 238.40,
    valueCr: 90.59,
    clientType: "Mutual Fund"
  },
  {
    id: "BD-107",
    symbol: "TATAMOTORS",
    date: "2026-05-18",
    clientName: "ICICI PRUDENTIAL MUTUAL FUND - BLUECHIP",
    dealType: "BUY",
    quantity: 1200000,
    price: 915.20,
    valueCr: 109.82,
    clientType: "Mutual Fund"
  },
  {
    id: "BD-108",
    symbol: "RPOWER",
    date: "2026-05-15",
    clientName: "MAHENDRA SHARMA (RETAIL HNI ASSOCIATE)",
    dealType: "SELL",
    quantity: 12000000,
    price: 28.10,
    valueCr: 33.72,
    clientType: "Retail/Other"
  }
];

export const REGULATION_31_EXAMPLES = {
  "RELIANCE": [
    { quarter: "Q1-2025", promoter: 50.39, fii: 22.10, dii: 15.10, retail: 12.41 },
    { quarter: "Q2-2025", promoter: 50.39, fii: 22.05, dii: 15.35, retail: 12.21 },
    { quarter: "Q3-2025", promoter: 50.39, fii: 22.15, dii: 15.80, retail: 11.66 },
    { quarter: "Q4-2025", promoter: 50.39, fii: 22.25, dii: 16.10, retail: 11.26 },
    { quarter: "Q1-2026", promoter: 50.39, fii: 22.41, dii: 16.55, retail: 10.65 }
  ],
  "ZOMATO": [
    { quarter: "Q1-2025", promoter: 0.00, fii: 48.20, dii: 18.20, retail: 33.60 },
    { quarter: "Q2-2025", promoter: 0.00, fii: 48.95, dii: 19.10, retail: 31.95 },
    { quarter: "Q3-2025", promoter: 0.00, fii: 49.50, dii: 20.80, retail: 29.70 },
    { quarter: "Q4-2025", promoter: 0.00, fii: 50.40, dii: 21.50, retail: 28.10 },
    { quarter: "Q1-2026", promoter: 0.00, fii: 51.20, dii: 23.40, retail: 25.40 }
  ],
  "SUZLON": [
    { quarter: "Q1-2025", promoter: 13.29, fii: 15.10, dii: 9.80, retail: 61.81 },
    { quarter: "Q2-2025", promoter: 13.29, fii: 16.40, dii: 10.50, retail: 59.81 },
    { quarter: "Q3-2025", promoter: 13.29, fii: 17.80, dii: 11.30, retail: 57.61 },
    { quarter: "Q4-2025", promoter: 13.29, fii: 18.50, dii: 12.10, retail: 56.11 },
    { quarter: "Q1-2026", promoter: 13.29, fii: 19.50, dii: 14.80, retail: 52.41 }
  ]
};
