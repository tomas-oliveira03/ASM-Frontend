export interface PriceDataPoint {
  date: string;
  price: number;
}

export interface SentimentDataPoint {
  date: string;
  sentiment: number;
}

export interface CryptoData {
  coin: string;
  historical_price: PriceDataPoint[];
  predicted_price: PriceDataPoint[];
  positive_sentiment_ratio: SentimentDataPoint[];
}

export type TimeRange = '7days' | '30days' | '1year';

export type CoinType = 'BTC' | 'ETH' | 'XRP' | 'BNB' | 'SOL' | 'DOGE' | 'TRX' | 'ADA';

export type DataField = 'historical_price' | 'predicted_price' | 'positive_sentiment_ratio';
