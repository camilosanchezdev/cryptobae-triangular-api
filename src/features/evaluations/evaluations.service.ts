import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisService } from 'src/cache/redis.service';
import { FindOptionsWhere, Repository } from 'typeorm';
import { BinanceService } from '../binance/binance.service';
import { BuyCryptoDto } from '../binance/dtos/buy-crypto.dto';
import { SellCryptoDto } from '../binance/dtos/sell-crypto.dto';
import { CreateFeeDto } from '../fees/dtos/create-fee.dto';
import { FeesService } from '../fees/fees.service';
import { CreateBuyOrderDto } from '../orders/dtos/create-buy-order.dto';
import { CreateSellOrderDto } from '../orders/dtos/create-sell-order.dto';
import { OrdersService } from '../orders/orders.service';
import { PricesService } from '../prices/prices.service';
import { CreateTransactionDto } from '../transactions/dtos/create-transaction.dto';
import { TransactionTypeEnum } from '../transactions/enums/transaction-type.enum';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionResultType } from '../transactions/types/transaction-result.type';
import { VaultsService } from '../vaults/vaults.service';
import { CreateWalletDto } from '../wallets/dtos/create-wallet.dto';
import { UpdateWalletDto } from '../wallets/dtos/update-wallet.dto';
import { WalletStatusesEnum } from '../wallets/enums/wallet-statuses.enum';
import { WalletTypesEnum } from '../wallets/enums/wallet-types.enum';
import { WalletsService } from '../wallets/wallets.service';
import { CreateEvaluationBuyDto } from './dtos/create-evaluation-buy.dto';
import { CreateEvaluationSellDto } from './dtos/create-evaluation-sell.dto';
import { CreateEvaluationDto } from './dtos/create-evaluation.dto';
import { EvaluationTypeEntity } from './entities/evaluation-type.entity';
import { EvaluationEntity } from './entities/evaluation.entity';
import { EvaluationBuyEntity } from './entities/evaluations-buy.entity';
import { EvaluationSellEntity } from './entities/evaluations-sell.entity';
import { RecommendedActionEntity } from './entities/recommended-actions.entity';
import { RecommendedActionEnum } from './enums/recommended-action.enum';
import { ProcessLoss } from './interfaces/process-loss.interface';
import { SellCryptocurrency } from './interfaces/sell-cryptocurrency.interface';
import { shouldBuy } from './utils/signals.util';

const pageSize = 10;

@Injectable()
export class EvaluationsService {
  cryptoProductionMode = process.env.CRYPTO_PRODUCTION_MODE === 'true';
  profitPercentage = Number(process.env.CRYPTO_PROFIT_PERCENTAGE); // 0.30% profit percentage to consider for selling
  lossLimitPercentage = Number(process.env.CRYPTO_LOSS_LIMIT_PERCENTAGE); // loss limit percentage to consider for selling
  highestLossLimitPercentage = Number(
    process.env.CRYPTO_HIGHEST_LOSS_LIMIT_PERCENTAGE,
  ); // loss limit percentage to consider for selling
  cryptoPosition = Number(process.env.CRYPTO_POSITION); // Position size for buying
  feePercentage = Number(process.env.CRYPTO_FEE_PERCENTAGE); // Trading fee percentage

  constructor(
    @InjectRepository(EvaluationEntity)
    private readonly repository: Repository<EvaluationEntity>,
    @InjectRepository(EvaluationTypeEntity)
    private readonly evaluationTypeRepository: Repository<EvaluationTypeEntity>,
    @InjectRepository(RecommendedActionEntity)
    private readonly recommendedActionEntity: Repository<RecommendedActionEntity>,
    @InjectRepository(EvaluationBuyEntity)
    private readonly evaluationBuyRepository: Repository<EvaluationBuyEntity>,
    @InjectRepository(EvaluationSellEntity)
    private readonly evaluationSellRepository: Repository<EvaluationSellEntity>,
    private readonly walletService: WalletsService,
    private readonly vaultsService: VaultsService,
    private readonly pricesService: PricesService,
    private readonly transactionsService: TransactionsService,
    private readonly redisService: RedisService,
    private readonly binanceService: BinanceService,
    private readonly ordersService: OrdersService,
    private readonly feesService: FeesService,
  ) {}

  async createEvaluationBuy(body: CreateEvaluationBuyDto) {
    const evaluation = this.evaluationBuyRepository.create(body);
    return this.evaluationBuyRepository.save(evaluation);
  }
  async createEvaluationSell(body: CreateEvaluationSellDto) {
    const evaluation = this.evaluationSellRepository.create(body);
    return this.evaluationSellRepository.save(evaluation);
  }
  async evaluateCryptocurrency(
    cryptocurrencyId: number,
    price: number,
    symbol: string,
  ) {
    if (!this.cryptoProductionMode) {
      return;
    }
    // 1. Check the amount in the vault using the race-condition-safe method
    const { hasEnoughCapital } =
      await this.vaultsService.checkAndReserveCapital(this.cryptoPosition);

    if (hasEnoughCapital) {
      await this.buyCryptocurrency(cryptocurrencyId, price, symbol);
    }
    // 2. Check wallets with that cryptocurrency
    await this.checkWallets(price, cryptocurrencyId, symbol);
  }
  async checkWallets(price: number, cryptocurrencyId: number, symbol: string) {
    const wallets =
      await this.walletService.getWalletsWithAmount(cryptocurrencyId);
    for (const wallet of wallets) {
      await this.sellCryptocurrency({
        amount: wallet.amount,
        initialPrice: wallet.initialPrice,
        price,
        cryptocurrencyId,
        walletId: wallet.id,
        highestFramePrice: wallet.highestFramePrice ?? 0,
        symbol,
        walletTypeId: wallet.walletTypeId,
      });
    }
  }
  processSellConditions(
    price: number,
    highestFramePrice: number,
    initialPrice: number,
  ) {
    // Constants
    const priceDifference = price - initialPrice;
    const priceDifferencePercentage = 100 * (priceDifference / initialPrice);

    // Calculate round-trip trading fees (buy + sell)
    const roundTripFeePercentage = this.feePercentage * 2; // 0.075% * 2 = 0.15%

    // Add small buffer on top of round-trip fees to ensure real profit
    const safetyBuffer = 0.05; // Additional 0.05% safety buffer
    const minimumProfitWithFees =
      this.profitPercentage + roundTripFeePercentage + safetyBuffer;

    // Simplified profit logic: ensure we have real profit after fees
    const hasRealProfit = priceDifferencePercentage >= minimumProfitWithFees;

    // Check if price dropped significantly from highest point
    const isMaxProfit =
      highestFramePrice > 0 &&
      price <
        highestFramePrice -
          (highestFramePrice * this.highestLossLimitPercentage) / 100;

    // Only sell if we have real profit AND (it's dropping from peak OR we hit our target)
    const multiplierPercentage = this.profitPercentage * 3; // 3x profit percentage for selling
    const mustSell =
      hasRealProfit &&
      (isMaxProfit || priceDifferencePercentage >= multiplierPercentage);

    const isLoss = priceDifferencePercentage <= this.lossLimitPercentage;
    const mustUpdateHighestFramePrice =
      priceDifferencePercentage >= this.profitPercentage &&
      price > highestFramePrice;
    return {
      mustSell,
      isLoss,
      mustUpdateHighestFramePrice,
      priceDifferencePercentage,
      priceDifference,
      hasRealProfit,
    };
  }
  async processLoss({
    price,
    initialPrice,
    cryptocurrencyId,
    highestFramePrice,
    walletId,
    walletTypeId,
  }: ProcessLoss) {
    if (walletTypeId === Number(WalletTypesEnum.LONG_TERM)) {
      return;
    }
    // Constants
    const priceDifference = price - initialPrice;
    const priceDifferencePercentage = 100 * (priceDifference / initialPrice);

    // Create evaluation sell
    const evaluationSell: CreateEvaluationSellDto = {
      currentPrice: price,
      initialPrice,
      priceDifference,
      priceDifferencePercentage,
      highestFramePrice,
      cryptocurrencyId,
      recommendedActionId: RecommendedActionEnum.MARK_AS_LONG_TERM,
      walletId,
    };
    await this.createEvaluationSell(evaluationSell);
    // Tag the wallet as long term
    await this.walletService.markWalletAsLongTerm(walletId);
  }

  async processBuyConditions(
    price: number,
    cryptocurrencyId: number,
    symbol: string,
  ) {
    const highestPriceFrame = Number(
      await this.pricesService.highestPriceOfFrame(cryptocurrencyId),
    );
    const minPriceYesterday = Number(
      await this.pricesService.minPriceYesterday(cryptocurrencyId),
    );
    const lowestPriceFrameSecondary = Number(
      await this.pricesService.lowestPriceOfFrameSecondary(cryptocurrencyId),
    );
    const averageVolume = Number(
      await this.pricesService.averageVolume(symbol),
    );
    const currentVolume = Number(
      await this.pricesService.currentVolume(symbol),
    );
    const averagePriceWeek =
      await this.pricesService.getAveragePriceWeek(cryptocurrencyId);
    // Buy if price crossing above 1H high (trend continuation)
    const trendContinuation = price > highestPriceFrame;
    // OR buy if price touching 6H low (dip buy)
    const dipBuy = price <= lowestPriceFrameSecondary * 1.01; // 1% tolerance for dip buy
    const isHigherVolume = currentVolume > averageVolume;
    const priceIsLowerThanAverage = price < averagePriceWeek * 1.02; // 2% above the average price week
    return {
      trendContinuation,
      dipBuy,
      isHigherVolume,
      minPriceYesterday,
      highestPriceFrame,
      lowestPriceFrameSecondary,
      currentVolume,
      averageVolume,
      priceIsLowerThanAverage,
      averagePriceWeek,
    };
  }
  async buyCryptocurrency(
    cryptocurrencyId: number,
    price: number,
    symbol: string,
  ) {
    const {
      trendContinuation,
      dipBuy,
      isHigherVolume,
      minPriceYesterday,
      lowestPriceFrameSecondary,
      highestPriceFrame,
      currentVolume,
      averageVolume,
      priceIsLowerThanAverage,
      averagePriceWeek,
    } = await this.processBuyConditions(price, cryptocurrencyId, symbol);

    if (
      (trendContinuation || dipBuy) &&
      isHigherVolume &&
      priceIsLowerThanAverage
    ) {
      // Create operation
      const amountToBuy = this.cryptoPosition / price; // Amount of cryptocurrency to buy
      // place market buy order
      const newOrder: BuyCryptoDto = {
        symbol,
        quantity: amountToBuy, // Assuming no external order ID
      };
      const responsePlaceMarketBuyOrder =
        await this.binanceService.placeMarketBuyOrder(newOrder);

      // Aggregate all fills from the order response
      const aggregatedFills = this.binanceService.aggregateFills(
        responsePlaceMarketBuyOrder.fills,
      );

      // Create Wallet
      const newWallet: CreateWalletDto = {
        cryptocurrencyId,
        amount: 0,
        initialPrice: 0,
      };

      const wallet = await this.walletService.createWallet(newWallet);
      const walletId = wallet.id;
      // Create evaluation buy
      const evaluationBuy: CreateEvaluationBuyDto = {
        currentPrice: price,
        minPriceYesterday,
        lowestPriceFrameSecondary,
        currentVolume,
        averageVolume,
        cryptocurrencyId,
        highestPriceFrame,
        averagePriceWeek,
        recommendedActionId: RecommendedActionEnum.BUY,
      };
      await this.createEvaluationBuy(evaluationBuy);
      // If it's the start of a new day, check if I should BUY

      const finalAmountBuy = aggregatedFills.totalQty;
      const finalPriceBuy = aggregatedFills.weightedPrice;
      // Create transaction
      const newTransaction: CreateTransactionDto = {
        amount: finalAmountBuy, // Amount of cryptocurrency to buy
        pricePerUnit: finalPriceBuy, // Price in USDT per unit of the cryptocurrency
        status: 'FILLED', // Assuming the transaction is filled
        cryptocurrencyId,
        transactionTypeId: TransactionTypeEnum.BUY,
        walletId, // Wallet ID where the transaction is recorded
      };
      const transaction =
        await this.transactionsService.createTransaction(newTransaction);

      // Create buy order using aggregated fills data
      const createBuyOrderDto: CreateBuyOrderDto = {
        symbol: responsePlaceMarketBuyOrder.symbol,
        externalOrderId: responsePlaceMarketBuyOrder.orderId,
        orderListId: responsePlaceMarketBuyOrder.orderListId,
        clientOrderId: responsePlaceMarketBuyOrder.clientOrderId,
        transactTime: responsePlaceMarketBuyOrder.transactTime,
        price: responsePlaceMarketBuyOrder.price,
        origQty: responsePlaceMarketBuyOrder.origQty,
        executedQty: responsePlaceMarketBuyOrder.executedQty,
        origQuoteOrderQty: responsePlaceMarketBuyOrder.origQuoteOrderQty,
        cummulativeQuoteQty: responsePlaceMarketBuyOrder.cummulativeQuoteQty,
        status: responsePlaceMarketBuyOrder.status,
        timeInForce: responsePlaceMarketBuyOrder.timeInForce,
        type: responsePlaceMarketBuyOrder.type,
        side: responsePlaceMarketBuyOrder.side,
        workingTime: responsePlaceMarketBuyOrder.workingTime,
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

      const updateWallet: UpdateWalletDto = {
        walletId,
        amount: finalAmountBuy,
        initialPrice: finalPriceBuy, // Set the initial price to the current price
        walletStatusId: WalletStatusesEnum.ACTIVE,
      };
      await this.walletService.updateWallet(updateWallet);
      const normalAmount = -(finalAmountBuy * finalPriceBuy);
      const normalizedAmount = Object.is(normalAmount, -0) ? 0 : normalAmount;
      await this.vaultsService.updateMasterVaultCapital(
        normalizedAmount,
        transaction.id,
      );
    } else {
      // Create evaluation buy
      const evaluationBuy: CreateEvaluationBuyDto = {
        currentPrice: price,
        minPriceYesterday,
        lowestPriceFrameSecondary,
        currentVolume,
        averageVolume,
        cryptocurrencyId,
        highestPriceFrame,
        averagePriceWeek,
        recommendedActionId: RecommendedActionEnum.NO_ACTION,
      };
      await this.createEvaluationBuy(evaluationBuy);
    }
  }
  async sellCryptocurrency({
    amount,
    initialPrice,
    price,
    cryptocurrencyId,
    walletId,
    highestFramePrice,
    symbol,
    walletTypeId,
  }: SellCryptocurrency) {
    const {
      mustSell,
      isLoss,
      mustUpdateHighestFramePrice,
      priceDifferencePercentage,
      priceDifference,
      hasRealProfit,
    } = this.processSellConditions(price, highestFramePrice, initialPrice);

    if (mustUpdateHighestFramePrice) {
      // Update the highest frame price in the wallet
      await this.walletService.updateHighestFramePrice(walletId, price);
    }

    //  When is loss
    if (isLoss) {
      await this.processLoss({
        price,
        initialPrice,
        cryptocurrencyId,
        highestFramePrice,
        walletId,
        walletTypeId,
      });
    } else if (!isLoss && mustSell && hasRealProfit) {
      // Calculate expected proceeds before placing sell order
      const expectedProceeds = amount * price;
      const estimatedFee = expectedProceeds * (this.feePercentage / 100); // Use actual fee percentage from env
      const expectedNet = expectedProceeds - estimatedFee;
      const originalCost = amount * initialPrice;

      // Additional safety check: ensure net proceeds > original cost
      if (expectedNet <= originalCost) {
        console.log(
          `Skipping sell - would result in loss. Expected net: ${expectedNet}, Original cost: ${originalCost}`,
        );
        return;
      }

      // place market sell order
      const newOrder: SellCryptoDto = {
        symbol,
        quantity: amount, // Assuming no external order ID
      };

      const responsePlaceMarketSellOrder =
        await this.binanceService.placeMarketSellOrder(newOrder);
      // Aggregate all fills from the order response
      const aggregatedFills = this.binanceService.aggregateFills(
        responsePlaceMarketSellOrder.fills,
      );
      const finalPriceToSell = aggregatedFills.weightedPrice;
      // Create evaluation sell
      const evaluationSell: CreateEvaluationSellDto = {
        currentPrice: finalPriceToSell,
        initialPrice,
        priceDifference,
        priceDifferencePercentage,
        highestFramePrice,
        cryptocurrencyId,
        recommendedActionId: RecommendedActionEnum.SELL,
        walletId,
      };
      await this.createEvaluationSell(evaluationSell);
      // SELL the cryptocurrency
      // Constants

      const finalAmountToSell = aggregatedFills.totalQty;
      let result: TransactionResultType = 'LOSS';

      if (priceDifferencePercentage >= this.profitPercentage) {
        result =
          priceDifferencePercentage > this.profitPercentage
            ? 'PROFIT'
            : 'BREAK_EVEN';
      }
      const profit =
        finalAmountToSell * finalPriceToSell - finalAmountToSell * initialPrice;

      // Update highest frame price to 0
      const defaultHighestFramePrice = 0;
      // Update the highest frame price in the wallet
      await this.walletService.updateHighestFramePrice(
        walletId,
        defaultHighestFramePrice,
      );
      // Create the transaction
      const newTransaction: CreateTransactionDto = {
        amount: finalAmountToSell, // Amount of cryptocurrency to buy
        pricePerUnit: finalPriceToSell, // Price in USDT per unit of the cryptocurrency
        status: 'FILLED', // Assuming the transaction is filled
        cryptocurrencyId,
        transactionTypeId: TransactionTypeEnum.SELL,
        walletId, // Wallet ID where the transaction is recorded
        result, // Result of the transaction
        profit,
      };
      const transaction =
        await this.transactionsService.createTransaction(newTransaction);

      // Create buy order using aggregated fills data
      const createBuyOrderDto: CreateSellOrderDto = {
        symbol: responsePlaceMarketSellOrder.symbol,
        externalOrderId: responsePlaceMarketSellOrder.orderId,
        orderListId: responsePlaceMarketSellOrder.orderListId,
        clientOrderId: responsePlaceMarketSellOrder.clientOrderId,
        transactTime: responsePlaceMarketSellOrder.transactTime,
        price: responsePlaceMarketSellOrder.price,
        origQty: responsePlaceMarketSellOrder.origQty,
        executedQty: responsePlaceMarketSellOrder.executedQty,
        origQuoteOrderQty: responsePlaceMarketSellOrder.origQuoteOrderQty,
        cummulativeQuoteQty: responsePlaceMarketSellOrder.cummulativeQuoteQty,
        status: responsePlaceMarketSellOrder.status,
        timeInForce: responsePlaceMarketSellOrder.timeInForce,
        type: responsePlaceMarketSellOrder.type,
        side: responsePlaceMarketSellOrder.side,
        workingTime: responsePlaceMarketSellOrder.workingTime,
        fillsPrice: aggregatedFills.weightedPrice.toString(),
        fillsQty: aggregatedFills.totalQty.toString(),
        fillsCommission: aggregatedFills.totalCommission.toString(),
        fillsCommissionAsset: aggregatedFills.commissionAsset,
        fillsTradeId: aggregatedFills.lastTradeId,
        transactionId: transaction.id,
      };

      const amountFee = (-aggregatedFills.totalCommission).toString(); // Negative because it's a fee
      const responseNewOrder =
        await this.ordersService.createSellOrder(createBuyOrderDto);

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

      const updateWallet: UpdateWalletDto = {
        walletId,
        amount: amount - finalAmountToSell,
        walletStatusId:
          amount - finalAmountToSell === 0
            ? WalletStatusesEnum.INACTIVE
            : WalletStatusesEnum.PARTIALLY_SOLD,
      };
      await this.walletService.updateWallet(updateWallet);

      const finalAmount = finalAmountToSell * finalPriceToSell;
      await this.vaultsService.updateMasterVaultCapital(
        Number(finalAmount),
        transaction.id,
      );
    } else {
      // Create evaluation sell
      const evaluationSell: CreateEvaluationSellDto = {
        currentPrice: price,
        initialPrice,
        priceDifference,
        priceDifferencePercentage,
        highestFramePrice,
        cryptocurrencyId,
        recommendedActionId: RecommendedActionEnum.NO_ACTION,
        walletId,
      };
      await this.createEvaluationSell(evaluationSell);
    }
  }

  async createEvaluation(body: CreateEvaluationDto) {
    const evaluation = this.repository.create(body);
    return await this.repository.save(evaluation);
  }

  async getEvaluations(
    cryptocurrencyId: number | undefined,
    evaluationTypeId: number | undefined,
    recommendedActionId: number | undefined,
    page: number = 1,
  ) {
    const currentPage: number = Number(page);
    const where: FindOptionsWhere<EvaluationEntity> = {
      ...(cryptocurrencyId && {
        cryptocurrencyId,
      }),
      ...(evaluationTypeId && {
        evaluationTypeId,
      }),
      ...(recommendedActionId && {
        recommendedActionId,
      }),
    };
    const skip = (currentPage - 1) * pageSize;
    const data = await this.repository.find({
      skip,
      take: pageSize,
      relations: ['cryptocurrency', 'evaluationType', 'recommendedAction'],
      order: { createdAt: 'DESC' },
      where,
    });
    const total = await this.repository.count({ where });

    return {
      page: currentPage,
      pageSize,
      total,
      data,
    };
  }
  async getEvaluationTypes() {
    const cacheKey = this.redisService.generateCacheKey(
      'evaluations_getEvaluationTypes',
    );

    // 1. Check Redis first
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData) as EvaluationTypeEntity[];
    }

    // 2. If no cache, perform the database query
    const evaluationTypes = await this.evaluationTypeRepository.find({
      where: { deleted: false },
    });

    // 3. Cache the result in Redis with a Time-to-Live (TTL)
    const ttlInSeconds = 60 * 60 * 24; // 24 hours (evaluation types rarely change)
    await this.redisService.set(
      cacheKey,
      JSON.stringify(evaluationTypes),
      ttlInSeconds,
    );

    return evaluationTypes;
  }

  async getRecommendedActions() {
    const cacheKey = this.redisService.generateCacheKey(
      'evaluations_getRecommendedActions',
    );

    // 1. Check Redis first
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData) as RecommendedActionEntity[];
    }

    // 2. If no cache, perform the database query
    const recommendedActions = await this.recommendedActionEntity.find({
      where: { deleted: false },
    });

    // 3. Cache the result in Redis with a Time-to-Live (TTL)
    const ttlInSeconds = 60 * 60 * 24; // 24 hours (recommended actions rarely change)
    await this.redisService.set(
      cacheKey,
      JSON.stringify(recommendedActions),
      ttlInSeconds,
    );

    return recommendedActions;
  }
  async signal(symbol: string) {
    return await shouldBuy(symbol);
  }
  async resetEvaluations(token: string) {
    const validToken = process.env.CRYPTO_MASTER_TOKEN;
    if (token !== validToken) {
      throw new BadRequestException('Invalid token');
    }
    // Delete all transactions
    await this.evaluationBuyRepository.delete({ deleted: false });
    await this.evaluationSellRepository.delete({ deleted: false });
    return await this.repository.delete({ deleted: false });
  }

  async getEvaluationsBuy(
    cryptocurrencyId: number | undefined,
    recommendedActionId: number | undefined,
    page: number = 1,
  ) {
    const currentPage = Number(page);
    const where: FindOptionsWhere<EvaluationEntity> = {
      ...(cryptocurrencyId && {
        cryptocurrencyId,
      }),
      ...(recommendedActionId && {
        recommendedActionId,
      }),
    };
    const skip = (currentPage - 1) * pageSize;
    const data = await this.evaluationBuyRepository.find({
      skip,
      take: pageSize,
      relations: ['cryptocurrency', 'recommendedAction'],
      order: { createdAt: 'DESC' },
      where,
    });
    const total = await this.evaluationBuyRepository.count({ where });

    return {
      page: currentPage,
      pageSize,
      total,
      data,
    };
  }
  async getEvaluationsSell(
    cryptocurrencyId: number | undefined,
    recommendedActionId: number | undefined,
    walletId: number | undefined,
    page: number = 1,
  ) {
    const currentPage = Number(page);
    const where: FindOptionsWhere<EvaluationEntity> = {
      ...(cryptocurrencyId && {
        cryptocurrencyId,
      }),
      ...(recommendedActionId && {
        recommendedActionId,
      }),
      ...(walletId && {
        walletId,
      }),
    };
    const skip = (currentPage - 1) * pageSize;
    const data = await this.evaluationSellRepository.find({
      skip,
      take: pageSize,
      relations: ['cryptocurrency', 'recommendedAction'],
      order: { createdAt: 'DESC' },
      where,
    });
    const total = await this.evaluationSellRepository.count({ where });

    return {
      page: currentPage,
      pageSize,
      total,
      data,
    };
  }
}
