export interface TriangularArbitrageStep {
  fromCrypto: string;
  toCrypto: string;
  tradingPair: string;
  price: number;
  amount: number;
}

export interface TriangularArbitrageAnalysis {
  id: number;
  profitPercentage: number;
  cycleStartCrypto: string;
  midCrypto: string;
  secondMidCrypto: string;
  endCrypto: string;
  steps: TriangularArbitrageStep[];
  initialAmount: number;
  finalAmount: number;
  createdAt: Date;
}
