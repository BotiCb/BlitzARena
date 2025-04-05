import { Injectable, UnauthorizedException, HttpException, Logger } from '@nestjs/common';
import { LoginRequestDto } from './dto/input/login-request.dto';
import { CreateUserDto } from './dto/input/create-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenDto } from './dto/output/access-token.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserModel } from 'src/shared/schemas/collections/user.schema';
import { EmailService } from 'src/shared/modules/email/email.service';
import { config } from 'src/shared/config/config';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(
    @InjectModel(UserModel.name) public readonly userModel: Model<UserModel>,
    private jwtService: JwtService,
    private emailService: EmailService
  ) {}

  async login(loginUserDto: LoginRequestDto): Promise<{ access_token: string; refresh_token: string }> {
    const { email, password } = loginUserDto;
    const user = await this.userModel.findOne({ email }).exec();

    if (!user || !(await bcrypt.compare(password, user.hashedPassword))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, id: user._id.toString() };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1m',
      secret: config.get('auth.jwtSecret'),
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: config.get('auth.refreshTokenSecret'),
    });

    const salt = await bcrypt.genSalt(10);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
    user.refreshTokenHash = hashedRefreshToken;

    user.lastLogin = new Date();
    await user.save();

    this.logger.log(`User ${user.email} logged in`);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshAccessToken(user: UserModel): Promise<AccessTokenDto> {
    const payload = { email: user.email, id: user._id.toString() };

    // Generate a new access token
    const newAccessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1m',
      secret: config.get('auth.jwtSecret'),
    });

    const newRefreshToken = await this.jwtService.signAsync(payload, {
      secret: config.get('auth.refreshTokenSecret'),
    });
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);

    const hashedRefreshToken = await bcrypt.hash(newRefreshToken, salt);
    user.refreshTokenHash = hashedRefreshToken;

    user.lastLogin = new Date();
    await user.save();

    this.logger.log(`Refreshed access token for user ${user.email}`);

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
      throw new HttpException('User already exists', 409);
    }
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const createdUser = new this.userModel({
      firstName,
      lastName,
      email,
      hashedPassword,
    });

    this.emailService.succesfullRegistration(createdUser);

    createdUser.lastLogin = new Date();
    await createdUser.save();

    this.logger.log(`User ${email} created`);
  }
}
