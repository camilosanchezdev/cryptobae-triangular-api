import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigurationEntity } from './entities/configurations.entity';
import { ConfigurationLogEntity } from './entities/configurations-log.entity';
import { UpdateConfigurationDto } from './dtos/update-configuration.dto';

@Injectable()
export class ConfigurationsService {
  constructor(
    @InjectRepository(ConfigurationEntity)
    private readonly repository: Repository<ConfigurationEntity>,
    @InjectRepository(ConfigurationLogEntity)
    private readonly logRepository: Repository<ConfigurationLogEntity>,
  ) {}

  async getConfigurations() {
    return await this.repository.find({
      where: { deleted: false },
      order: { key: 'ASC' },
    });
  }
  async getConfiguration(key: string): Promise<ConfigurationEntity> {
    const configuration = await this.repository.findOne({
      where: { key, deleted: false },
    });
    if (!configuration) {
      throw new BadRequestException(`Configuration not found for key: ${key}`);
    }
    return configuration;
  }
  async createConfiguration(
    configuration: Partial<ConfigurationEntity>,
  ): Promise<ConfigurationEntity> {
    const existingConfiguration = await this.repository.findOne({
      where: { key: configuration.key, deleted: false },
    });
    if (existingConfiguration) {
      throw new BadRequestException(
        `Configuration with key ${configuration.key} already exists`,
      );
    }
    const newConfiguration = this.repository.create(configuration);
    return this.repository.save(newConfiguration);
  }
  async updateConfiguration(
    key: string,
    { value }: Partial<UpdateConfigurationDto>,
  ) {
    const existingConfiguration = await this.repository.findOne({
      where: { key: key, deleted: false },
    });

    if (!existingConfiguration) {
      throw new BadRequestException(`Configuration with key ${key} no exists`);
    }

    const regex = new RegExp(
      existingConfiguration.regex.replace(/^\/|\/$/g, ''),
    );
    if (typeof value !== 'string' || !regex.test(value)) {
      throw new BadRequestException('Invalid value format');
    }

    await this.repository.update(
      { key: key, deleted: false },

      { value: value },
    );
    const logConfiguration = this.logRepository.create({
      key: existingConfiguration.key,
      value,
      oldValue: existingConfiguration.value,
      configurationId: existingConfiguration.id,
    });
    await this.logRepository.save(logConfiguration);
  }
}
