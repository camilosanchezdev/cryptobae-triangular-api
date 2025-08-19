export interface OrderBookResponse {
  lastUpdateId: number;
  bids: Array<[string, string]>;
  asks: Array<[string, string]>;
}
