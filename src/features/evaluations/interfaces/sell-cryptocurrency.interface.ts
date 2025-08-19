export interface SellCryptocurrency {
  amount: number;
  initialPrice: number;
  price: number;
  cryptocurrencyId: number;
  walletId: number;
  highestFramePrice: number;
  symbol: string;
  walletTypeId: number;
}
