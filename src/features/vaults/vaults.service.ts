import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { CreateTransactionDto } from '../transactions/dtos/create-transaction.dto';
import { TransactionTypeEnum } from '../transactions/enums/transaction-type.enum';
import { TransactionsService } from '../transactions/transactions.service';
import { CreateVaultMovementDto } from './dtos/create-vault-movement';
import { DepositDto } from './dtos/deposit.dto';
import { WithdrawalDto } from './dtos/withdrawal.dto';
import { MasterVaultEntity } from './entities/master-vault.entity';
import { VaultMovementEntity } from './entities/vault-movement.entity';
import { MasterVaultsEnum } from './enums/master-vaults.enum';

@Injectable()
export class VaultsService {
  constructor(
    @InjectRepository(MasterVaultEntity)
    private readonly masterVaultRepository: Repository<MasterVaultEntity>,
    @InjectRepository(VaultMovementEntity)
    private readonly vaultMovementRepository: Repository<VaultMovementEntity>,
    private readonly transactionsService: TransactionsService,
    private readonly dataSource: DataSource,
  ) {}

  async getVaultByName(name: string): Promise<MasterVaultEntity> {
    const vault = await this.masterVaultRepository.findOne({
      where: { name, deleted: false },
    });
    if (!vault) {
      throw new BadRequestException(`Vault with name ${name} not found`);
    }
    return vault;
  }
  //
  async updateMasterVaultFee(
    amount: number,
    transactionId: number,
  ): Promise<MasterVaultEntity> {
    return this.dataSource.transaction(async (manager) => {
      // Use atomic update with increment
      const result = await manager
        .createQueryBuilder()
        .update(MasterVaultEntity)
        .set({
          amount: () => `amount + ${amount}`,
        })
        .where('name = :name', { name: MasterVaultsEnum.BNB })
        .execute();

      if (result.affected === 0) {
        throw new Error('Master vault fee not found');
      }

      // Get the updated vault to get the old and new amounts for movement tracking
      const masterVault = await manager.findOne(MasterVaultEntity, {
        where: { name: MasterVaultsEnum.BNB },
      });

      if (!masterVault) {
        throw new Error('Master vault fee not found after update');
      }

      // Create vault movement with the calculated values
      const oldAmount = Number(masterVault.amount) - amount;
      await this.createVaultMovementWithManager(manager, {
        masterVaultId: masterVault.id,
        oldAmount,
        transactionId,
        amount: masterVault.amount,
        difference: amount,
      });

      return masterVault;
    });
  }
  async createVaultMovement(body: CreateVaultMovementDto) {
    const vaultMovement = this.vaultMovementRepository.create(body);
    return this.vaultMovementRepository.save(vaultMovement);
  }

  private async createVaultMovementWithManager(
    manager: EntityManager,
    body: CreateVaultMovementDto,
  ) {
    const vaultMovement = manager.create(VaultMovementEntity, body);
    return await manager.save(vaultMovement);
  }
  async resetVaults(token: string) {
    const validToken = process.env.CRYPTO_MASTER_TOKEN;
    if (token !== validToken) {
      throw new BadRequestException('Invalid token');
    }
    // Remove vault movements
    await this.vaultMovementRepository.delete({ deleted: false });
    return await this.masterVaultRepository.updateAll({
      amount: 0,
    });
  }

  async createWithdrawal({ amount, vaultId }: WithdrawalDto) {
    if (amount <= 0) {
      throw new BadRequestException(
        'Withdrawal amount must be greater than zero',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const masterVault = await manager.findOne(MasterVaultEntity, {
        where: { id: vaultId },
      });

      if (!masterVault) {
        throw new BadRequestException(
          `Master vault not found for ID: ${vaultId}`,
        );
      }

      // Check if sufficient funds are available
      if (Number(masterVault.amount) < amount) {
        throw new BadRequestException('Insufficient funds for withdrawal');
      }

      // Create a transaction for the withdrawal
      const newTransaction: CreateTransactionDto = {
        amount,
        transactionTypeId: TransactionTypeEnum.WITHDRAWAL,
        status: 'FILLED',
        result: 'SUCCESS',
      };
      const transaction =
        await this.transactionsService.createTransaction(newTransaction);

      // Use atomic update with decrement
      const result = await manager
        .createQueryBuilder()
        .update(MasterVaultEntity)
        .set({
          amount: () => `amount - ${amount}`,
        })
        .where('id = :id', { id: vaultId })
        .execute();

      if (result.affected === 0) {
        throw new BadRequestException(
          `Master vault not found for ID: ${vaultId}`,
        );
      }

      // Get the updated vault
      const updatedVault = await manager.findOne(MasterVaultEntity, {
        where: { id: vaultId },
      });

      if (!updatedVault) {
        throw new Error('Master vault not found after update');
      }

      // Create vault movement
      const oldAmount = Number(updatedVault.amount) + amount;
      await this.createVaultMovementWithManager(manager, {
        masterVaultId: updatedVault.id,
        oldAmount,
        transactionId: transaction.id,
        amount: updatedVault.amount,
        difference: -amount,
      });

      return updatedVault;
    });
  }

  async createDeposit({ amount, vaultId }: DepositDto) {
    if (amount <= 0) {
      throw new BadRequestException('Deposit amount must be greater than zero');
    }

    return this.dataSource.transaction(async (manager) => {
      const masterVault = await manager.findOne(MasterVaultEntity, {
        where: { id: vaultId },
      });

      if (!masterVault) {
        throw new BadRequestException(
          `Master vault not found for ID: ${vaultId}`,
        );
      }

      // Create a transaction for the deposit
      const newTransaction: CreateTransactionDto = {
        amount,
        transactionTypeId: TransactionTypeEnum.DEPOSIT,
        status: 'FILLED',
        result: 'SUCCESS',
      };
      const transaction =
        await this.transactionsService.createTransaction(newTransaction);

      // Use atomic update with increment
      const result = await manager
        .createQueryBuilder()
        .update(MasterVaultEntity)
        .set({
          amount: () => `amount + ${amount}`,
        })
        .where('id = :id', { id: vaultId })
        .execute();

      if (result.affected === 0) {
        throw new BadRequestException(
          `Master vault not found for ID: ${vaultId}`,
        );
      }

      // Get the updated vault
      const updatedVault = await manager.findOne(MasterVaultEntity, {
        where: { id: vaultId },
      });

      if (!updatedVault) {
        throw new Error('Master vault not found after update');
      }

      // Create vault movement
      const oldAmount = Number(updatedVault.amount) - amount;
      await this.createVaultMovementWithManager(manager, {
        masterVaultId: updatedVault.id,
        oldAmount,
        transactionId: transaction.id,
        amount: updatedVault.amount,
        difference: amount,
      });

      return updatedVault;
    });
  }
  async getMasterVaults(): Promise<MasterVaultEntity[]> {
    return this.masterVaultRepository.find({
      where: { deleted: false },
      order: { name: 'ASC' },
    });
  }

  async getMasterVaultCapital() {
    const masterVault = await this.masterVaultRepository.findOne({
      where: { name: MasterVaultsEnum.USDT },
    });
    if (!masterVault) {
      throw new Error('Master vault capital not found');
    }
    return masterVault;
  }

  async checkAndReserveCapital(
    requiredAmount: number,
  ): Promise<{ hasEnoughCapital: boolean; vaultAmount: number }> {
    return this.dataSource.transaction(async (manager) => {
      const masterVault = await manager.findOne(MasterVaultEntity, {
        where: { name: MasterVaultsEnum.USDT },
        lock: { mode: 'pessimistic_write' },
      });

      if (!masterVault) {
        throw new Error('Master vault capital not found');
      }

      const currentAmount = Number(masterVault.amount);
      const hasEnoughCapital = currentAmount >= requiredAmount;

      return {
        hasEnoughCapital,
        vaultAmount: currentAmount,
      };
    });
  }
  async updateMasterVaultCapital(
    amount: number,
    transactionId: number,
  ): Promise<MasterVaultEntity> {
    return this.dataSource.transaction(async (manager) => {
      // Use atomic update with increment
      const result = await manager
        .createQueryBuilder()
        .update(MasterVaultEntity)
        .set({
          amount: () => `amount + ${amount}`,
        })
        .where('name = :name', { name: MasterVaultsEnum.USDT })
        .execute();

      if (result.affected === 0) {
        throw new Error('Master vault capital not found');
      }

      // Get the updated vault to get the old and new amounts for movement tracking
      const masterVault = await manager.findOne(MasterVaultEntity, {
        where: { name: MasterVaultsEnum.USDT },
      });

      if (!masterVault) {
        throw new Error('Master vault capital not found after update');
      }

      // Create vault movement with the calculated values
      const oldAmount = Number(masterVault.amount) - amount;
      await this.createVaultMovementWithManager(manager, {
        masterVaultId: masterVault.id,
        oldAmount,
        transactionId,
        amount: masterVault.amount,
        difference: amount,
      });

      return masterVault;
    });
  }
  async getMasterVaultMovements(vaultId: number, page: number = 1) {
    const pageSize = 10;
    const currentPage: number = Number(page);
    const where: FindOptionsWhere<VaultMovementEntity> = {
      ...(vaultId && {
        masterVaultId: vaultId,
      }),
    };
    const skip = (currentPage - 1) * pageSize;
    const data = await this.vaultMovementRepository.find({
      skip,
      take: pageSize,
      relations: ['masterVault'],
      order: { createdAt: 'DESC' },
      where,
    });
    const total = await this.vaultMovementRepository.count({ where });

    return {
      page: currentPage,
      pageSize,
      total,
      data,
    };
  }
  async updateVaultCapital(
    name: string,
    amount: number,
    transactionId: number,
  ): Promise<MasterVaultEntity> {
    return this.dataSource.transaction(async (manager) => {
      // Use atomic update with increment
      const result = await manager
        .createQueryBuilder()
        .update(MasterVaultEntity)
        .set({
          amount: () => `amount + ${amount}`,
        })
        .where('name = :name', { name })
        .execute();

      if (result.affected === 0) {
        throw new Error('Master vault not found');
      }

      // Get the updated vault to get the old and new amounts for movement tracking
      const masterVault = await manager.findOne(MasterVaultEntity, {
        where: { name },
      });

      if (!masterVault) {
        throw new Error('Master vault not found after update');
      }

      // Create vault movement with the calculated values
      const oldAmount = Number(masterVault.amount) - amount;
      await this.createVaultMovementWithManager(manager, {
        masterVaultId: masterVault.id,
        oldAmount,
        transactionId,
        amount: masterVault.amount,
        difference: amount,
      });

      return masterVault;
    });
  }
}
