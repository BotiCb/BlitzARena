import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserModel } from '../shared/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { FileUploadService } from 'src/shared/modules/file-upload/file-upload.service';
import { EmailService } from 'src/shared/modules/email/email.service';
import { UpdateUserDto } from './dto/input/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserModel.name) public readonly userModel: Model<UserModel>,
    private readonly fileUploadService: FileUploadService,
    private emailService: EmailService
  ) {}

  async findUserById(id: string): Promise<UserModel> {
    return this.userModel.findOne({ _id: id }).exec();
  }

  async findAll(queryArgs: { keyword?: string }, limit: number, offset?: number): Promise<UserModel[]> {
    const queryParams: any = {};

    if (queryArgs.keyword) {
      queryParams['$or'] = [
        { firstName: { $regex: queryArgs.keyword, $options: 'i' } },
        { lastName: { $regex: queryArgs.keyword, $options: 'i' } },
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ['$firstName', ' ', '$lastName'] },
              regex: queryArgs.keyword,
              options: 'i',
            },
          },
        },
        { email: { $regex: queryArgs.keyword, $options: 'i' } },
      ];
    }

    return this.userModel.find(queryParams).skip(offset).limit(limit).exec();
  }

  async findOneByEmail(email: string): Promise<UserModel> {
    const user: UserModel = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    return user;
  }


  findByGameId(gameId: string): Promise<UserModel[]> {
    return this.userModel.find({ recentGameId: gameId }).exec();
  }

  findBySessionId(sessionId: string): Promise<UserModel> {
    return this.userModel.findOne({ recentSessionId: sessionId }).exec();
  }

  async updatePassword(user: UserModel, passwords: UpdateUserDto, isAdmin?: boolean) {
    if (isAdmin) {
      return await this.changePassword(user, passwords.newPassword);
    }
    if (!passwords.password || !passwords.newPassword) {
      throw new HttpException('password and newPassword are required', 400);
    }
    const isMatchWithOld = await bcrypt.compare(passwords.password, user.hashedPassword);
    if (!isMatchWithOld) {
      throw new HttpException('Invalid password', 400);
    }
    if (passwords.newPassword === passwords.password) {
      throw new HttpException('The new password must be different', 400);
    }

    return await this.changePassword(user, passwords.newPassword);
  }

  async changePassword(user: UserModel, newPassword: string) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);
    user.hashedPassword = newHashedPassword;
    await user.save();
  }

  async uploadProfilePicture(user: UserModel, file: Express.Multer.File): Promise<string> {
    const url = await this.fileUploadService.uploadProfilePicture(file, user.photoUrl);
    user.photoUrl = url;
    await user.save();
    return url;
  }

  async updateUser(user: UserModel, updateUserDto?: UpdateUserDto, file?: Express.Multer.File, isAdmin?: boolean) {
    if (file && file.size > 0) {
      const url = await this.fileUploadService.uploadProfilePicture(file, user.photoUrl);
      user.photoUrl = url;
    } else if (file && file.size === 0) {
      this.fileUploadService.deleteFile(user.photoUrl);
      user.photoUrl = '';
    }

    if (updateUserDto?.newPassword) {
      await this.updatePassword(user, updateUserDto, isAdmin);
    }

    delete updateUserDto.password;
    delete updateUserDto.newPassword;

    if (updateUserDto) {
      Object.assign(user, updateUserDto);
    }

    await user.save();
  }

  async deleteUser(user: UserModel) {
    this.fileUploadService.deleteFile(user.photoUrl);
    this.emailService.userDeleted(user);
    await this.userModel.deleteOne({ _id: user._id }).exec();
  }
}
