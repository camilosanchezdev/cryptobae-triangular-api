import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationsSeedService } from './configurations-seed.service';
import { ConfigurationEntity } from '../../../features/configurations/entities/configurations.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConfigurationEntity])],
  providers: [ConfigurationsSeedService],
  exports: [ConfigurationsSeedService],
})
export class ConfigurationsSeedModule {}
