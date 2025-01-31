import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Mongoose } from 'mongoose';
import { UserModel } from './user.schema';

@Schema({ timestamps: true })
export class GameModel extends Document {

    @Prop({ required: true })
    gameId: string

    @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'UserModel', index: true })
    creatorUser: UserModel

    @Prop({ required: true, type : [MongooseSchema.Types.ObjectId], ref: 'UserModel', index: true })
    players: UserModel[]
}

export const GameSchema = SchemaFactory.createForClass(GameModel);