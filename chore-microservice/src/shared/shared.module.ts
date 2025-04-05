import { Module } from '@nestjs/common';
import { EmailModule } from './modules/email/email.module';
import { FileUploadModule } from './modules/file-upload/file-upload.module';
import { AxiosModule } from './modules/axios/axios.module';
import { PersonDetectionModule } from '../person-detection/person-detection.module';
import { BlitzARenaMongooseModule } from './modules/blitzARena-mongoose/blitzARena-mongoose.module';
@Module({
  imports: [BlitzARenaMongooseModule, FileUploadModule, EmailModule, AxiosModule],
  providers: [],
  exports: [BlitzARenaMongooseModule, FileUploadModule, EmailModule, AxiosModule],
})
export class SharedModule {}
