import { Injectable } from '@nestjs/common';
import {
  BinanceOrderResponse,
  BinanceService,
} from '../binance/binance.service';
import { BuyCryptoDto } from '../binance/dtos/buy-crypto.dto';
import { SellCryptoDto } from '../binance/dtos/sell-crypto.dto';
import { CreateFeeDto } from '../fees/dtos/create-fee.dto';
import { FeesService } from '../fees/fees.service';
import { CreateBuyOrderDto } from '../orders/dtos/create-buy-order.dto';
import { OrdersService } from '../orders/orders.service';
import { CreateTransactionDto } from '../transactions/dtos/create-transaction.dto';
import { TransactionTypeEnum } from '../transactions/enums/transaction-type.enum';
import { TransactionsService } from '../transactions/transactions.service';
import { VaultsService } from '../vaults/vaults.service';
import { CreateArbitrageDto } from './dtos/create-arbitrage.dto';
import { SaveOrdersRequest } from './interfaces/save-orders-request.interface';

@Injectable()
export class ArbitrageService {
  private readonly minCryptoPosition = Number(process.env.CRYPTO_POSITION);
  constructor(
    private readonly binanceService: BinanceService,
    private readonly vaultsService: VaultsService,
    private readonly transactionsService: TransactionsService,
    private readonly ordersService: OrdersService,
    private readonly feesService: FeesService,
  ) {}
  async createArbitrage(
    body: CreateArbitrageDto,
  ): Promise<SaveOrdersRequest | null> {
    const vault = await this.vaultsService.getVaultByName(body.startStable);
    if (vault.amount <= 0 || vault.amount < this.minCryptoPosition) {
      return null;
    }
    const initialAmount = vault.amount;

    // Step 1: buy cryptocurrency 1
    const firstOrderQuantity = initialAmount / body.firstOrderPrice;
    // example:
    // firstOrderQuantity = 10 / 0.23829 = 41.9
    const marketBuyOrder: BuyCryptoDto = {
      symbol: body.firstOrderSymbol,
      quantity: firstOrderQuantity,
    };
    console.log(
      '🚀 ~ ArbitrageService ~ createArbitrage ~ marketBuyOrder:',
      marketBuyOrder,
    );
    const firstOrder =
      await this.binanceService.placeMarketBuyOrder(marketBuyOrder);
    console.log(
      '🚀 ~ ArbitrageService ~ createArbitrage ~ firstOrder:',
      firstOrder,
    );

    // Step 2: buy cryptocurrency 2
    const secondOrderQuantity =
      Number(firstOrder.executedQty) * body.secondOrderPrice;
    // example: HBARBTC
    // secondOrderQuantity = 41 * 0,0000021 = 0,0000861
    const marketBuyOrder2: SellCryptoDto = {
      symbol: body.secondOrderSymbol,
      quantity: secondOrderQuantity,
    };
    console.log(
      '🚀 ~ ArbitrageService ~ createArbitrage ~ marketBuyOrder2:',
      marketBuyOrder2,
    );
    const secondOrder =
      await this.binanceService.placeMarketSellOrder(marketBuyOrder2);
    console.log(
      '🚀 ~ ArbitrageService ~ createArbitrage ~ secondOrder:',
      secondOrder,
    );
    // Step 3: sell cryptocurrency 2
    const thirdOrderQuantity = Number(secondOrder.executedQty);

    const marketSellOrder: SellCryptoDto = {
      symbol: body.thirdOrderSymbol,
      quantity: thirdOrderQuantity,
    };
    console.log(
      '🚀 ~ ArbitrageService ~ createArbitrage ~ marketSellOrder:',
      marketSellOrder,
    );
    const thirdOrder =
      await this.binanceService.placeMarketSellOrder(marketSellOrder);
    console.log(
      '🚀 ~ ArbitrageService ~ createArbitrage ~ thirdOrder:',
      thirdOrder,
    );

    return {
      orders: [firstOrder, secondOrder, thirdOrder],
      firstTradingPairId: body.firstTradingPairId,
      secondTradingPairId: body.secondTradingPairId,
      thirdTradingPairId: body.thirdTradingPairId,
      startStable: body.startStable,
      finalAsset: body.finalAsset,
    };
  }
  async updateVault(
    finalAmountBuy: number,
    finalPriceBuy: number,
    transactionId: number,
    name: string,
    isBuy: boolean,
  ) {
    let normalAmount = finalAmountBuy * finalPriceBuy;
    if (isBuy) {
      normalAmount *= -1;
    }
    const normalizedAmount = Object.is(normalAmount, -0) ? 0 : normalAmount;
    await this.vaultsService.updateVaultCapital(
      name,
      normalizedAmount,
      transactionId,
    );
  }
  async createOrder(order: BinanceOrderResponse, tradingPairId: number) {
    // Aggregate all fills from the order response
    const aggregatedFills = this.binanceService.aggregateFills(order.fills);
    const finalAmountBuy = aggregatedFills.totalQty;
    const finalPriceBuy = aggregatedFills.weightedPrice;
    const newTransaction: CreateTransactionDto = {
      amount: finalAmountBuy,
      pricePerUnit: finalPriceBuy,
      status: 'FILLED',
      tradingPairId,
      transactionTypeId: TransactionTypeEnum.BUY,
    };
    const transaction =
      await this.transactionsService.createTransaction(newTransaction);
    // Create order
    // Create buy order using aggregated fills data
    const createBuyOrderDto: CreateBuyOrderDto = {
      symbol: order.symbol,
      externalOrderId: order.orderId,
      orderListId: order.orderListId,
      clientOrderId: order.clientOrderId,
      transactTime: order.transactTime,
      price: order.price,
      origQty: order.origQty,
      executedQty: order.executedQty,
      origQuoteOrderQty: order.origQuoteOrderQty,
      cummulativeQuoteQty: order.cummulativeQuoteQty,
      status: order.status,
      timeInForce: order.timeInForce,
      type: order.type,
      side: order.side,
      workingTime: order.workingTime,
      fillsPrice: aggregatedFills.weightedPrice.toString(),
      fillsQty: aggregatedFills.totalQty.toString(),
      fillsCommission: aggregatedFills.totalCommission.toString(),
      fillsCommissionAsset: aggregatedFills.commissionAsset,
      fillsTradeId: aggregatedFills.lastTradeId,
      transactionId: transaction.id,
    };

    const amountFee = (-aggregatedFills.totalCommission).toString(); // Negative because it's a fee
    const responseNewOrder =
      await this.ordersService.createBuyOrder(createBuyOrderDto);
    // create fee
    const createFeeDto: CreateFeeDto = {
      amount: amountFee,
      orderId: responseNewOrder.id,
    };
    await this.feesService.createFee(createFeeDto);
    // update master vault fee
    await this.vaultsService.updateMasterVaultFee(
      Number(amountFee),
      transaction.id,
    );

    return { finalAmountBuy, finalPriceBuy, transactionId: transaction.id };
  }
  async saveOrders(requests: SaveOrdersRequest[]) {
    for (const request of requests) {
      const firstOrder = request.orders[0];
      const secondOrder = request.orders[1];
      const thirdOrder = request.orders[2];
      // TRANSACTIONS & ORDERS
      // Order #1
      const firstOperation = await this.createOrder(
        firstOrder,
        request.firstTradingPairId,
      );
      // Order #2
      await this.createOrder(secondOrder, request.secondTradingPairId);
      // Order #3
      const lastOperation = await this.createOrder(
        thirdOrder,
        request.thirdTradingPairId,
      );

      // Update master vault capital
      // Decrease initial vault
      await this.updateVault(
        firstOperation.finalAmountBuy,
        firstOperation.finalPriceBuy,
        firstOperation.transactionId,
        request.startStable,
        true,
      );

      // Increase final vault
      await this.updateVault(
        lastOperation.finalAmountBuy,
        lastOperation.finalPriceBuy,
        lastOperation.transactionId,
        request.finalAsset,
        false,
      );
    }
  }
}
