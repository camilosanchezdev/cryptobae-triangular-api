export interface ArbitrageOpportunityRequest {
  profitPercentage: number;
  askPrice1: number;
  askPrice2: number;
  bidPrice: number;
  minProfitPercent: number;
  firstTradingPairId: number;
  secondTradingPairId: number;
  thirdTradingPairId: number;
  startStable: string;
  firstOrderSymbol: string; // Optional, can be undefined
  secondOrderSymbol: string; // Optional, can be undefined
  thirdOrderSymbol: string; // Optional, can be undefined
  finalAsset: string; // Optional, can be undefined
}
