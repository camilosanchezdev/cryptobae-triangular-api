export interface CreateArbitrage {
  initialAmount: number;
  firstOrderSymbol: string;
  firstOrderPrice: number;
  secondOrderSymbol: string;
  secondOrderPrice: number;
  thirdOrderSymbol: string;
  thirdOrderPrice: number;
}
