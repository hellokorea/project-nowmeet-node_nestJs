import * as path from "path";
import * as AWS from "aws-sdk";
import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PromiseResult } from "aws-sdk/lib/request";
import { UsersRepository } from "src/users/users.repository";

@Injectable()
export class AwsService {
  private readonly awsS3: AWS.S3;
  public readonly S3_BUCKET_NAME: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersRepository: UsersRepository
  ) {
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

  replaceProfileImages(oldImages: string[], newImages: string[]): string[] {
    let updatedImages = [...oldImages];

    const MAX_PROFILE_IMAGES = 3;

    newImages.forEach((newKey, index) => {
      if (index < MAX_PROFILE_IMAGES) {
        if (updatedImages[index]) {
          updatedImages[index] = newKey;
        } else {
          updatedImages.push(newKey);
        }
      }
    });

    return updatedImages.slice(0, MAX_PROFILE_IMAGES);
  }

  async createPreSignedUrl(keys: string[]) {
    const signedUrls = await Promise.all(
      keys.map((key) => {
        const signedUrlParams = {
          Bucket: this.S3_BUCKET_NAME,
          Key: key,
          Expires: 60 * 5,
        };

        return this.awsS3.getSignedUrl("getObject", signedUrlParams);
      })
    );

    return signedUrls;
  }

  async deleteFilesFromS3(keys: string[]) {
    console.log(keys.length);
    console.log(keys);
    try {
      const deletePromises = keys.map((key) => {
        console.log(key);
        return this.awsS3
          .deleteObject({
            Bucket: this.S3_BUCKET_NAME,
            Key: key,
          })
          .promise();
      });
      await Promise.all(deletePromises);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(`파일 삭제에 실패 했습니다 : ${error}`);
    }
  }
}
