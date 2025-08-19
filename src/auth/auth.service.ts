import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginDto } from './dtos/login.dto';

@Injectable()
export class AuthService {
  login({ email, password }: LoginDto) {
    const defaultEmail = process.env.DEFAULT_EMAIL;
    const defaultPassword = process.env.DEFAULT_PASSWORD;
    if (!defaultEmail || !defaultPassword) {
      throw new Error(
        'Default email or password not set in environment variables',
      );
    }
    if (email === defaultEmail && password === defaultPassword) {
      const access_token = process.env.API_KEY;
      return {
        access_token,
      };
    }

    throw new BadRequestException('Not authorized, check your credentials');
  }
}
