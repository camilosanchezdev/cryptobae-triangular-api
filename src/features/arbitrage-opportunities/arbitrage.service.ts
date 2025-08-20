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

@Injectable()
export class ArbitrageService {
  constructor(
    private readonly binanceService: BinanceService,
    private readonly vaultsService: VaultsService,
    private readonly transactionsService: TransactionsService,
    private readonly ordersService: OrdersService,
    private readonly feesService: FeesService,
  ) {}
  async createArbitrage(body: CreateArbitrageDto) {
    const vault = await this.vaultsService.getVaultByName(body.startStable);
    if (vault.amount < 0) {
      return;
    }
    const initialAmount = vault.amount;
    // Step 1: buy cryptocurrency 1
    const firstOrderQuantity = initialAmount / body.firstOrderPrice;
    const marketBuyOrder: BuyCryptoDto = {
      symbol: body.firstOrderSymbol,
      quantity: firstOrderQuantity,
    };
    const firstOrder =
      await this.binanceService.placeMarketBuyOrder(marketBuyOrder);

    // Step 2: buy cryptocurrency 2
    const secondOrderQuantity =
      Number(firstOrder.executedQty) / body.secondOrderPrice;
    const marketBuyOrder2: BuyCryptoDto = {
      symbol: body.secondOrderSymbol,
      quantity: secondOrderQuantity,
    };
    const secondOrder =
      await this.binanceService.placeMarketBuyOrder(marketBuyOrder2);
    // Step 3: sell cryptocurrency 2
    const thirdOrderQuantity =
      Number(secondOrder.executedQty) * body.thirdOrderPrice;
    const marketSellOrder: SellCryptoDto = {
      symbol: body.secondOrderSymbol,
      quantity: thirdOrderQuantity,
    };
    const thirdOrder =
      await this.binanceService.placeMarketSellOrder(marketSellOrder);

    // TRANSACTIONS & ORDERS
    // Order #1
    const firstOperation = await this.createOrder(
      firstOrder,
      body.firstTradingPairId,
    );
    // Order #2
    await this.createOrder(secondOrder, body.secondTradingPairId);
    // Order #3
    const lastOperation = await this.createOrder(
      thirdOrder,
      body.thirdTradingPairId,
    );

    // Update master vault capital
    // Decrease initial vault
    await this.updateVault(
      firstOperation.finalAmountBuy,
      firstOperation.finalPriceBuy,
      firstOperation.transactionId,
      body.startStable,
      true,
    );

    // Increase final vault
    await this.updateVault(
      lastOperation.finalAmountBuy,
      lastOperation.finalPriceBuy,
      lastOperation.transactionId,
      body.startStable,
      false,
    );
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
}
