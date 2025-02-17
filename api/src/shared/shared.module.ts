import { Logger, Module } from '@nestjs/common';
import { CustomMongooseModule } from './modules/custom-mongoose/custom-mongoose.module';
import { EmailModule } from './modules/email/email.module';
import { FileUploadModule } from './modules/file-upload/file-upload.module';
import { AxiosModule } from './modules/axios/axios.module';
@Module({
  imports: [CustomMongooseModule, FileUploadModule, EmailModule, AxiosModule],
  providers: [],
  exports: [CustomMongooseModule, FileUploadModule, EmailModule, AxiosModule],
})
export class SharedModule {}
