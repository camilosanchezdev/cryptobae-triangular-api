import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeeEntity } from './entities/fee.entity';
import { FeesController } from './fees.controller';
import { FeesService } from './fees.service';

@Module({
  imports: [TypeOrmModule.forFeature([FeeEntity])],
  controllers: [FeesController],
  providers: [FeesService],
  exports: [FeesService],
})
export class FeesModule {}
