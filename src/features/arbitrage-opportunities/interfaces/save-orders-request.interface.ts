import { BinanceOrderResponse } from 'src/features/binance/binance.service';

export interface SaveOrdersRequest {
  orders: BinanceOrderResponse[];
  firstTradingPairId: number;
  secondTradingPairId: number;
  thirdTradingPairId: number;
  startStable: string;
  finalAsset: string;
}
