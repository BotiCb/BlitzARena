import { Injectable, UnauthorizedException, HttpException } from '@nestjs/common';
import { LoginRequestDto } from './dto/input/login-request.dto';
import { CreateUserDto } from './dto/input/create-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenDto } from './dto/output/access-token.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserModel } from 'src/shared/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { EmailService } from 'src/shared/modules/email/email.service';
import { config } from 'src/shared/config/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel.name) public readonly userModel: Model<UserModel>,
    private jwtService: JwtService,
    private userService: UsersService,
    private emailService: EmailService
  ) {}

  async login(loginUserDto: LoginRequestDto): Promise<{ access_token: string; refresh_token: string }> {
    const { email, password } = loginUserDto;
    const user = await this.userService.findOneByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.hashedPassword))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, id: user._id.toString() };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1m',
      secret: config.get('auth.jwtSecret'),
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: config.get('auth.refreshTokenSecret'),
    });

    const hashedRefreshToken = refreshToken;
    user.refreshTokenHash = hashedRefreshToken;

    user.lastLogin = new Date();
    await user.save();

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string, user: UserModel): Promise<AccessTokenDto> {
    const payload = { email: user.email, id: user._id.toString() };

    // Generate a new access token
    const newAccessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1m',
      secret: config.get('auth.jwtSecret'),
    });

    const newRefreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: config.get('auth.refreshTokenSecret'),
    });
    const hashedRefreshToken = newRefreshToken;
    user.refreshTokenHash = hashedRefreshToken;

    user.lastLogin = new Date();
    await user.save();

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }

  async logout(user: UserModel): Promise<void> {
    user.refreshTokenHash = null;
    await user.save();
  }

  async create(createUserDto: CreateUserDto): Promise<void> {
    const { firstName, lastName, email, password } = createUserDto;

    if ((await this.userModel.findOne({ email }).exec()) !== null) {
      throw new HttpException('User already exists', 400);
    }
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const createdUser = new this.userModel({
      firstName,
      lastName,
      email,
      hashedPassword,
      createdAt: new Date(),
    });

    this.emailService.succesfullRegistration(createdUser);

    createdUser.lastLogin = new Date();
    await createdUser.save();
  }
}
