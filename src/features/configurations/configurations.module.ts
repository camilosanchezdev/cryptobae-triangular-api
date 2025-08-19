import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationEntity } from './entities/configurations.entity';
import { ConfigurationsService } from './configurations.service';
import { ConfigurationsController } from './configurations.controller';
import { ConfigurationLogEntity } from './entities/configurations-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConfigurationEntity, ConfigurationLogEntity]),
  ],
  controllers: [ConfigurationsController],
  providers: [ConfigurationsService],
  exports: [ConfigurationsService],
})
export class ConfigurationsModule {}
