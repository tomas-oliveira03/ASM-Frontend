import { CoinType, CryptoData, TimeRange } from '../types';
import btcData from '../../../../BTC_data_export.json';

// Use the BTC data export file
const realBtcData = btcData as CryptoData;

// Mock data for other coins, but use real BTC data
const mockData: Record<CoinType, CryptoData> = {
  'BTC': realBtcData,
  'ETH': {
    coin: 'ETH',
    historical_price: [
      { date: '2024-05-01', price: 2943.78 },
      { date: '2024-05-02', price: 2967.45 },
      { date: '2024-05-03', price: 2989.12 },
      { date: '2024-05-04', price: 3012.21 },
      { date: '2024-05-05', price: 3056.78 },
      { date: '2024-05-06', price: 3089.34 },
      { date: '2024-05-07', price: 3102.23 },
      { date: '2024-05-08', price: 3145.81 }
    ],
    predicted_price: [
      { date: '2024-05-09', price: 3200.12 },
      { date: '2024-05-10', price: 3250.34 },
      { date: '2024-05-11', price: 3300.56 },
      { date: '2025-04-19', price: 5342.08 }
    ],
    positive_sentiment_ratio: [
      { date: '2024-05-01', sentiment: 0.4723 },
      { date: '2024-05-02', sentiment: 0.4812 },
      { date: '2024-05-03', sentiment: 0.4921 },
      { date: '2024-05-04', sentiment: 0.4878 },
      { date: '2024-05-05', sentiment: 0.4967 },
      { date: '2024-05-06', sentiment: 0.5002 },
      { date: '2024-05-07', sentiment: 0.5089 },
      { date: '2024-05-08', sentiment: 0.5135 }
    ]
  },
  'XRP': { 
    coin: 'XRP',
    historical_price: Array(8).fill(null).map((_, i) => ({ 
      date: `2024-05-0${i+1}`, 
      price: 0.5 + Math.random() * 0.1 
    })),
    predicted_price: [
      { date: '2024-05-09', price: 0.57 },
      { date: '2025-04-19', price: 0.95 }
    ],
    positive_sentiment_ratio: Array(8).fill(null).map((_, i) => ({ 
      date: `2024-05-0${i+1}`, 
      sentiment: 0.45 + Math.random() * 0.1 
    }))
  },
  'BNB': { 
    coin: 'BNB',
    historical_price: Array(8).fill(null).map((_, i) => ({ 
      date: `2024-05-0${i+1}`, 
      price: 400 + Math.random() * 20 
    })),
    predicted_price: [
      { date: '2024-05-09', price: 425 },
      { date: '2025-04-19', price: 550 }
    ],
    positive_sentiment_ratio: Array(8).fill(null).map((_, i) => ({ 
      date: `2024-05-0${i+1}`, 
      sentiment: 0.48 + Math.random() * 0.1 
    }))
  },
  'SOL': { 
    coin: 'SOL',
    historical_price: Array(8).fill(null).map((_, i) => ({ 
      date: `2024-05-0${i+1}`, 
      price: 120 + Math.random() * 10 
    })),
    predicted_price: [
      { date: '2024-05-09', price: 135 },
      { date: '2025-04-19', price: 210 }
    ],
    positive_sentiment_ratio: Array(8).fill(null).map((_, i) => ({ 
      date: `2024-05-0${i+1}`, 
      sentiment: 0.51 + Math.random() * 0.1 
    }))
  },
  'DOGE': { 
    coin: 'DOGE',
    historical_price: Array(8).fill(null).map((_, i) => ({ 
      date: `2024-05-0${i+1}`, 
      price: 0.1 + Math.random() * 0.02 
    })),
    predicted_price: [
      { date: '2024-05-09', price: 0.125 },
      { date: '2025-04-19', price: 0.25 }
    ],
    positive_sentiment_ratio: Array(8).fill(null).map((_, i) => ({ 
      date: `2024-05-0${i+1}`, 
      sentiment: 0.55 + Math.random() * 0.1 
    }))
  },
  'TRX': { 
    coin: 'TRX',
    historical_price: Array(8).fill(null).map((_, i) => ({ 
      date: `2024-05-0${i+1}`, 
      price: 0.08 + Math.random() * 0.01 
    })),
    predicted_price: [
      { date: '2024-05-09', price: 0.09 },
      { date: '2025-04-19', price: 0.15 }
    ],
    positive_sentiment_ratio: Array(8).fill(null).map((_, i) => ({ 
      date: `2024-05-0${i+1}`, 
      sentiment: 0.47 + Math.random() * 0.1 
    }))
  },
  'ADA': { 
    coin: 'ADA',
    historical_price: Array(8).fill(null).map((_, i) => ({ 
      date: `2024-05-0${i+1}`, 
      price: 0.35 + Math.random() * 0.05 
    })),
    predicted_price: [
      { date: '2024-05-09', price: 0.40 },
      { date: '2025-04-19', price: 0.75 }
    ],
    positive_sentiment_ratio: Array(8).fill(null).map((_, i) => ({ 
      date: `2024-05-0${i+1}`, 
      sentiment: 0.49 + Math.random() * 0.1 
    }))
  },
};

export const getCryptoData = (coin: CoinType): CryptoData => {
  return mockData[coin];
};

export const filterDataByTimeRange = (data: CryptoData, timeRange: TimeRange): CryptoData => {
  // Get the latest date in the dataset to use as reference point
  const dates = [...data.historical_price.map(item => item.date)];
  const latestDate = new Date(Math.max(...dates.map(date => new Date(date).getTime())));
  
  let startDate: Date;

  switch (timeRange) {
    case '7days':
      startDate = new Date(latestDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30days':
      startDate = new Date(latestDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '1year':
      startDate = new Date(latestDate.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
  }

  const startDateString = startDate.toISOString().split('T')[0];
  
  return {
    coin: data.coin,
    historical_price: data.historical_price.filter(item => item.date >= startDateString),
    predicted_price: data.predicted_price.filter(item => item.date >= startDateString),
    positive_sentiment_ratio: data.positive_sentiment_ratio.filter(item => item.date >= startDateString),
  };
};

export const getAvailableCoins = (): CoinType[] => {
  return Object.keys(mockData) as CoinType[];
};
