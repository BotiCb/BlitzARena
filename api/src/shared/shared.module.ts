import { Module } from '@nestjs/common';
import { CustomMongooseModule } from './modules/custom-mongoose/custom-mongoose.module';
import { EmailModule } from './modules/email/email.module';
import { FileUploadModule } from './modules/file-upload/file-upload.module';
@Module({
  imports: [CustomMongooseModule, FileUploadModule, EmailModule],
  exports: [CustomMongooseModule, FileUploadModule, EmailModule],
})
export class SharedModule {}
