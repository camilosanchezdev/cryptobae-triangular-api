import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express'; // Import Request from 'express'
import * as process from 'process'; // Import process for environment variables

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'] as string; // Common header for API keys

    // Check if the API key is provided
    if (!apiKey) {
      throw new UnauthorizedException('API key is missing.');
    }

    // Compare the provided API key with your stored secret API key
    // For production, consider hashing and comparing hashed keys for better security,
    // though for a single personal key, direct comparison is acceptable if stored securely.
    if (apiKey !== process.env.API_KEY) {
      throw new UnauthorizedException('Invalid API key.');
    }

    return true; // Allow the request to proceed
  }
}
