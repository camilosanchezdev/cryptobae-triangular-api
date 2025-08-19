import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisService } from 'src/cache/redis.service';
import { FindOptionsWhere, In, MoreThan, Repository } from 'typeorm';
import { CreateWalletDto } from './dtos/create-wallet.dto';
import { UpdateWalletDto } from './dtos/update-wallet.dto';
import { WalletStatusEntity } from './entities/wallet-status.entity';
import { WalletTypeEntity } from './entities/wallet-type.entity';
import { WalletEntity } from './entities/wallet.entity';
import { WalletStatusesEnum } from './enums/wallet-statuses.enum';
import { WalletTypesEnum } from './enums/wallet-types.enum';

const pageSize = 10;
@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(WalletEntity)
    private readonly repository: Repository<WalletEntity>,
    @InjectRepository(WalletTypeEntity)
    private readonly walletTypeRepository: Repository<WalletTypeEntity>,
    @InjectRepository(WalletStatusEntity)
    private readonly walletStatusRepository: Repository<WalletStatusEntity>,
    private readonly redisService: RedisService,
  ) {}

  async updateWallet({
    walletId,
    amount,
    initialPrice,
    walletStatusId,
  }: UpdateWalletDto) {
    const wallet = await this.repository.findOne({
      where: { id: walletId, deleted: false },
    });
    if (!wallet) {
      throw new Error(`Wallet not found for ID: ${walletId}`);
    }
    wallet.amount = amount;
    if (initialPrice) {
      wallet.initialPrice = initialPrice;
    }
    wallet.walletStatusId = walletStatusId;

    return this.repository.save(wallet);
  }

  async getWallets(
    cryptocurrencyId: number | undefined,
    walletTypeId: number | undefined,
    walletStatusId: number | undefined,
    page: number = 1,
  ) {
    const currentPage: number = Number(page);
    const where: FindOptionsWhere<WalletEntity> = {
      ...(cryptocurrencyId && {
        cryptocurrencyId,
      }),
      ...(walletTypeId && {
        walletTypeId,
      }),
      ...(walletStatusId && {
        walletStatusId,
      }),
    };
    const skip = (currentPage - 1) * pageSize;
    const data = await this.repository.find({
      skip,
      take: pageSize,
      relations: ['cryptocurrency', 'walletType', 'walletStatus'],
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

  async updateHighestFramePrice(
    walletId: number,
    highestFramePrice: number,
  ): Promise<WalletEntity> {
    const wallet = await this.repository.findOne({
      where: { id: walletId },
    });
    if (!wallet) {
      throw new Error(
        `Wallet not found for ID: ${walletId} - Cannot update highest frame price`,
      );
    }
    wallet.highestFramePrice = highestFramePrice;
    return this.repository.save(wallet);
  }
  async resetWallets(token: string) {
    const validToken = process.env.CRYPTO_MASTER_TOKEN;
    if (token !== validToken) {
      throw new BadRequestException('Invalid token');
    }

    await this.repository.delete({ deleted: false });
  }
  async markWalletAsLongTerm(walletId: number): Promise<WalletEntity> {
    const wallet = await this.repository.findOne({
      where: { id: walletId },
    });
    if (!wallet) {
      throw new Error(`Wallet not found for ID: ${walletId}`);
    }
    wallet.walletTypeId = WalletTypesEnum.LONG_TERM;

    return this.repository.save(wallet);
  }
  async createWallet(body: CreateWalletDto) {
    const newWallet = this.repository.create({
      ...body,
      deleted: false,
      walletTypeId: WalletTypesEnum.SHORT_TERM,
      walletStatusId: WalletStatusesEnum.ACTIVE,
    });
    return this.repository.save(newWallet);
  }
  async getWalletsWithAmount(cryptocurrencyId: number) {
    return this.repository.find({
      where: {
        deleted: false,
        cryptocurrencyId,
        walletStatusId: WalletStatusesEnum.ACTIVE,
        amount: MoreThan(0),
      },
      relations: ['cryptocurrency'],
    });
  }
  async getWalletTypes() {
    const cacheKey = this.redisService.generateCacheKey(
      'wallets_getWalletTypes',
    );

    // 1. Check Redis first
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData) as WalletTypeEntity[];
    }

    const walletTypes = await this.walletTypeRepository.find({
      where: { deleted: false },
    });
    const ttlInSeconds = 60 * 60 * 24; // 1 day
    await this.redisService.set(
      cacheKey,
      JSON.stringify(walletTypes),
      ttlInSeconds,
    );
    return walletTypes;
  }
  async getWalletStatuses() {
    const cacheKey = this.redisService.generateCacheKey(
      'wallets_getWalletStatuses',
    );

    // 1. Check Redis first
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData) as WalletStatusEntity[];
    }

    const walletStatuses = await this.walletStatusRepository.find({
      where: { deleted: false },
      select: ['id', 'name'],
    });
    const ttlInSeconds = 60 * 60 * 24; // 1 day
    await this.redisService.set(
      cacheKey,
      JSON.stringify(walletStatuses),
      ttlInSeconds,
    );
    return walletStatuses;
  }

  async getWalletsStats() {
    const wallets = await this.repository.find({
      where: {
        deleted: false,
        walletStatusId: In([
          WalletStatusesEnum.ACTIVE,
          WalletStatusesEnum.PARTIALLY_SOLD,
        ]),
      },
      select: ['amount', 'initialPrice'],
    });

    const totalAmount = wallets.reduce((sum, wallet) => {
      return sum + Number(wallet.amount) * Number(wallet.initialPrice);
    }, 0);

    return {
      totalAmount,
      count: wallets.length,
    };
  }
}
