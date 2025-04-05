import { Controller, Get, Body, HttpException, Put, Param, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserMapper } from './users.mapper';
import { UpdateUserDto } from './dto/input/update-user.dto';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { UserModel } from 'src/shared/schemas/collections/user.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserProfileDto } from './dto/output/user-profile.dto';
import { UserInfoDto } from './dto/output/user-info.dto';
import { isObjectId } from 'src/shared/utils/mapper';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DetailedUserProfileDto, InGameUserInfoDto } from './dto/output/detailed-user-profile';
import { EmailService } from 'src/shared/modules/email/email.service';
import { PlayerInGameRole, UserRole } from 'src/shared/decorators/roles.decorator';
@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userMapper: UserMapper,
    private readonly emailService: EmailService
  ) {}

  @Get()
  async getAllUsers(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('sortField') sortField?: string,
    @Query('sortDirection') sortDirection?: string,
    @Query('keyword') keyword?: string
  ): Promise<UserInfoDto[]> {
    const limitNumber = parseInt(limit, 10) || 10;
    const _offset = parseInt(offset, 10) || 0;
    const queryArgs = { keyword };
    return (await this.usersService.findAll(queryArgs, limitNumber, _offset)).map((user) =>
      this.userMapper.fromUserModelToUserInfoDto(user)
    );
  }
  @UserRole()
  @Get('profile')
  async getProfile(@CurrentUser() user: UserModel): Promise<UserProfileDto> {
    return this.userMapper.toUserProfileDto(user);
  }

  @UserRole()
  @Get('info')
  getUserInfo(@CurrentUser() user: UserModel): UserInfoDto {
    return this.userMapper.fromUserModelToUserInfoDto(user);
  }

  @UserRole()
  @UseInterceptors(FileInterceptor('file'))
  @Put()
  async updateProfile(
    @CurrentUser() user: UserModel,
    @UploadedFile() file?: Express.Multer.File,
    @Body() dto?: UpdateUserDto
  ) {
    if (Object.keys(dto).length === 0 && file == undefined) {
      throw new HttpException('Empty body', 400);
    }

    return this.usersService.updateUser(user, dto, file);
  }

  @PlayerInGameRole()
  @Get('ingameinfo/:gameId')
  async getInGameUserInfos(
    @CurrentUser() user: UserModel,
    @Param('gameId') gameId: string
  ): Promise<InGameUserInfoDto[]> {
    return (await this.usersService.findByGameId(gameId)).map(this.userMapper.fromUserModelToInGameUserInfoDto);
  }

  @UserRole()
  @Get('ingameinfo/session-id/:sessionId')
  async getInGameUserInfo(@Param('sessionId') sessionId: string): Promise<InGameUserInfoDto> {
    const user = await this.usersService.findBySessionId(sessionId);
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    return this.userMapper.fromUserModelToInGameUserInfoDto(user);
  }

  @UserRole()
  @Get(':id')
  async findUserById(@Param('id') id: string): Promise<DetailedUserProfileDto> {
    if (!isObjectId(id)) {
      throw new HttpException('Invalid Id', 400);
    }
    const user = await this.usersService.findUserById(id);
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    return this.userMapper.toDetailedUserInfoDto(user);
  }
}
