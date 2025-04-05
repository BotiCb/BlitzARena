import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as sharp from 'sharp';
import { InferenceSession, Tensor } from 'onnxruntime-node';


@Injectable()
export class PersonDetectionService implements OnModuleInit {
  private session: InferenceSession;
  private readonly logger = new Logger(PersonDetectionService.name);
  private readonly MIN_CONFIDENCE = 0.65;
  private readonly INPUT_SIZE = 224;


  async onModuleInit() {
    await this.initializeModel();
  }

  private async initializeModel(): Promise<void> {
    try {
      this.logger.log('Initializing ONNX model...');
      
      // Load your ONNX model (adjust path as needed)
      this.session = await InferenceSession.create(
        './human224v3.onnx',
        {
          executionProviders: ['cpu'], // Use CPU for compatibility
          graphOptimizationLevel: 'all',
        }
      );
      
      this.logger.log('ONNX model initialized successfully');
    } catch (error) {
      this.logger.error('Model initialization failed:', error);
      throw new Error('Failed to initialize person detection model');
    }
  }

  async detectPerson(imageBuffer: Buffer): Promise<boolean> {
    if (!this.session) {
      throw new Error('Person detection model not initialized');
    }

    try {
      const { tensor } = await this.preprocessImage(imageBuffer);


      const results = await this.session.run({ images: tensor });     
      const output = results.output0; 
   
      return Number(output.data[0]) > this.MIN_CONFIDENCE;
    } catch (error) {
      this.logger.error('Detection failed:', error);
      throw new Error('Failed to process image for person detection');
    }
  }

  private async preprocessImage(imageBuffer: Buffer): Promise<{ tensor: Tensor }> {
    const { data, info } = await sharp(imageBuffer)
      .removeAlpha()
      .resize(this.INPUT_SIZE, this.INPUT_SIZE)
      .raw()
      .toBuffer({ resolveWithObject: true });

    if (info.width !== this.INPUT_SIZE || info.height !== this.INPUT_SIZE) {
      throw new Error(`Invalid image dimensions after resizing`);
    }

    const channels = 3;
    const stride = this.INPUT_SIZE * this.INPUT_SIZE;
    const float32Data = new Float32Array(channels * stride);

    for (let c = 0; c < channels; c++) {
      for (let h = 0; h < this.INPUT_SIZE; h++) {
        for (let w = 0; w < this.INPUT_SIZE; w++) {
          const srcIdx = h * this.INPUT_SIZE * channels + w * channels + c;
          const dstIdx = c * stride + h * this.INPUT_SIZE + w;
          float32Data[dstIdx] = data[srcIdx] / 255.0;
        }
      }
    }

    return {
      tensor: new Tensor('float32', float32Data, [1, 3, this.INPUT_SIZE, this.INPUT_SIZE]),
    };
  }

}