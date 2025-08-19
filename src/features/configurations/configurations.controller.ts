import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyGuard } from '../../auth/auth.guard';
import { ConfigurationsService } from './configurations.service';
import { CreateConfigurationDto } from './dtos/create-configuration.dto';
import { UpdateConfigurationDto } from './dtos/update-configuration.dto';

@Controller('configurations')
export class ConfigurationsController {
  constructor(private readonly configurationsService: ConfigurationsService) {}

  @UseGuards(ApiKeyGuard)
  @Get()
  async getConfigurations() {
    return this.configurationsService.getConfigurations();
  }

  @UseGuards(ApiKeyGuard)
  @Get(':key')
  async getConfiguration(@Param('key') key: string) {
    return this.configurationsService.getConfiguration(key);
  }

  @UseGuards(ApiKeyGuard)
  @Post()
  async createConfiguration(@Body() body: CreateConfigurationDto) {
    return this.configurationsService.createConfiguration(body);
  }
  @UseGuards(ApiKeyGuard)
  @Put(':key')
  async updateConfiguration(
    @Param('key') key: string,
    @Body() body: UpdateConfigurationDto,
  ) {
    return this.configurationsService.updateConfiguration(key, body);
  }
}
