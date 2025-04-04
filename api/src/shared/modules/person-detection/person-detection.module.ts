import { Module } from "@nestjs/common";
import { PersonDetectionService } from "./person-detecton.service";

@Module({
  imports: [],
    providers: [PersonDetectionService],
    exports: [PersonDetectionService],
})
export class PersonDetectionModule {}