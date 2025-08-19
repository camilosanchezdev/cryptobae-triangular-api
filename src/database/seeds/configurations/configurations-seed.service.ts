import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigurationEntity } from '../../../features/configurations/entities/configurations.entity';

@Injectable()
export class ConfigurationsSeedService {
  constructor(
    @InjectRepository(ConfigurationEntity)
    private repository: Repository<ConfigurationEntity>,
  ) {}

  async run() {
    const items = [
      {
        key: 'MASTER_VAULT',
        value: '0',
        regex: '/^-?\\d+(\\.\\d+)?$/',
      },
      {
        key: 'MASTER_VAULT_AVAILABLE',
        value: '1500',
        regex: '/^-?\\d+(\\.\\d+)?$/',
      },
    ];
    const count = await this.repository.count();
    if (count > 0) {
      return;
    }
    // Insert with specific IDs
    for (const item of items) {
      await this.repository.save(
        this.repository.create({
          ...item,
        }),
      );
    }
  }
}
