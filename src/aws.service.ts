import * as path from "path";
import * as AWS from "aws-sdk";
import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PromiseResult } from "aws-sdk/lib/request";
import { FileInterceptor } from "@nestjs/platform-express";

@Injectable()
export class AwsService {
  private readonly awsS3: AWS.S3;
  public readonly S3_BUCKET_NAME: string;

  constructor(private readonly configService: ConfigService) {
    this.awsS3 = new AWS.S3({
      accessKeyId: this.configService.get("AWS_S3_ACCESS_KEY"),
      secretAccessKey: this.configService.get("AWS_S3_SECRET_KEY"),
      region: this.configService.get("AWS_S3_REGION"),
    });
    this.S3_BUCKET_NAME = this.configService.get("AWS_S3_BUCKET_NAME");
  }

  async uploadFilesToS3(
    folder: string,
    files: Array<Express.Multer.File>
  ): Promise<
    Array<{
      key: string;
      s3Object: PromiseResult<AWS.S3.PutObjectOutput, AWS.AWSError>;
      contentType: string;
    }>
  > {
    try {
      const uploadPromises = files.map(async (file) => {
        const key = `${folder}/${Date.now()}_${path.basename(file.originalname)}`.replace(/ /g, "");

        const s3Object = await this.awsS3
          .putObject({
            Bucket: this.S3_BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
          })
          .promise();

        return { key, s3Object, contentType: file.mimetype };
      });
      return Promise.all(uploadPromises);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(`파일 업로드에 실패 했습니다 : ${error}`);
    }
  }

  async deleteS3Object(
    key: string,
    callback?: (err: AWS.AWSError, data: AWS.S3.DeleteObjectOutput) => void
  ): Promise<{ success: true; key: string }> {
    try {
      await this.awsS3
        .deleteObject(
          {
            Bucket: this.S3_BUCKET_NAME,
            Key: key,
          },
          callback
        )
        .promise();
      return { success: true, key };
    } catch (error) {
      throw new BadRequestException(`파일 업로드에 실패 했습니다 : ${error}`);
    }
  }

  public getAwsS3FileUrl(objectKey: string) {
    return `https://${this.S3_BUCKET_NAME}.s3.amazonaws.com/${objectKey}`;
  }
}
