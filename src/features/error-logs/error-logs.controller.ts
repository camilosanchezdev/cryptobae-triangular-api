import { Controller } from '@nestjs/common';
import { ErrorLogsService } from './error-logs.service';

@Controller('error-logs')
export class ErrorLogsController {
  constructor(private readonly errorLogsService: ErrorLogsService) {}
}
