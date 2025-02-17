import { IsNumber } from "class-validator";

export class TrainingRequestDto{
    @IsNumber()
    numClasses: number

    @IsNumber()
    numImagesPerClass: number
}