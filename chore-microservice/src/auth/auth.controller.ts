import { Controller, Post, Body, HttpException, HttpCode, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/input/login-request.dto';
import { CreateUserDto } from './dto/input/create-user.dto';
import { AccessTokenDto } from './dto/output/access-token.dto';
import { UserRole } from 'src/shared/decorators/roles.decorator';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { UserModel } from 'src/shared/schemas/collections/user.schema';
import { RefreshTokenGuard } from 'src/shared/guards/refresh-token-guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() loginRequestDto: LoginRequestDto): Promise<AccessTokenDto> {
    const { email, password } = loginRequestDto;
    if (!email || !password) {
      throw new HttpException('Missing required fields or wrong dto', 400);
    }
    return this.authService.login(loginRequestDto);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  async refresh(@CurrentUser() user: UserModel) {
    return this.authService.refreshAccessToken(user);
  }

  @HttpCode(200)
  @UserRole()
  @Post('logout')
  async logout(@CurrentUser() user: UserModel) {
    return this.authService.logout(user);
  }

  @Post('register')
  register(@Body() createUserDto: CreateUserDto): Promise<void> {
    const { firstName, lastName, email, password } = createUserDto;
    if (!firstName || !lastName || !email || !password) {
      throw new HttpException('Missing required fields or wrong dto', 400);
    }

    return this.authService.create(createUserDto);
  }
}
