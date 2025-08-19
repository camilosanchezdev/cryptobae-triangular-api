export interface BinanceTickerData {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  c: string; // Close price
  o: string; // Open price
  h: string; // High price
  l: string; // Low price
  v: string; // Total traded base asset volume
  q: string; // Total traded quote asset volume
  P: string; // Price change percent
  O: number; // Statistics open time
  C: number; // Statistics close time
  F: number; // First trade ID
  L: number; // Last trade ID
  n: number; // Total number of trades
}

export interface BinancePriceData {
  symbol: string;
  price: number;
  priceChangePercent: number;
  volume: number;
  timestamp: number;
}

export interface CryptoPriceUpdate {
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  lastUpdated: Date;
}
