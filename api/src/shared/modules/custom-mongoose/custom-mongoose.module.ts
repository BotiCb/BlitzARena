import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel, UserSchema } from 'src/shared/schemas/user.schema';
import { config } from 'src/shared/config/config';

@Module({
  imports: [
    MongooseModule.forRoot(config.get('db.url')),
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema, collection: 'User' }]),
  ],
  exports: [
    MongooseModule.forRoot(config.get('db.url')),
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema, collection: 'User' }]),
  ],
})
export class CustomMongooseModule {}
