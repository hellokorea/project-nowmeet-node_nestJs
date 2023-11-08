import * as path from "path";
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { S3RequestPresigner } from "@aws-sdk/s3-request-presigner";
import { createRequest } from "@aws-sdk/util-create-request";
import { formatUrl } from "@aws-sdk/util-format-url";

@Injectable()
export class AwsService {
  private readonly s3Client: S3Client;
  public readonly S3_USER_PROFILES_BUCKET_NAME: string;
  public readonly S3_DEPLOY_BUCKET_NAME: string;
  public readonly S3_USER_DEV_PROFILES_BUCKET_NAME: string;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      credentials: {
        //* Prod
        accessKeyId: this.configService.get("PROD_AWS_S3_ACCESS_KEY"),
        secretAccessKey: this.configService.get("PROD_AWS_S3_SECRET_KEY"),
        //& dev
        // accessKeyId: this.configService.get("DEV_AWS_S3_ACCESS_KEY"),
        // secretAccessKey: this.configService.get("DEV_AWS_S3_SECRET_KEY"),
      },
      region: this.configService.get("AWS_S3_REGION"),
    });

    //* Prod
    this.S3_USER_PROFILES_BUCKET_NAME = this.configService.get("AWS_S3_USER_PROFILES_BUCKET_NAME");
    this.S3_DEPLOY_BUCKET_NAME = this.configService.get("AWS_S3_DEPLOY_BUCKET_NAME");
    //& dev
    this.S3_USER_DEV_PROFILES_BUCKET_NAME = this.configService.get("AWS_S3_USER_DEV_PROFILES_BUCKET_NAME");
  }

  async uploadFilesToS3(folder: string, files: Array<Express.Multer.File>) {
    try {
      const uploadPromises = files.map(async (file) => {
        const key = `${folder}/${Date.now()}_${path.basename(file.originalname)}`.replace(/ /g, "");

        const putCommand = new PutObjectCommand({
          Bucket: this.S3_USER_PROFILES_BUCKET_NAME,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        });

        const s3Object = await this.s3Client.send(putCommand);
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
    const signer = new S3RequestPresigner({
      ...this.s3Client.config,
    });

    const signedUrls = await Promise.all(
      keys.map(async (key) => {
        const command = new GetObjectCommand({
          Bucket: this.S3_USER_PROFILES_BUCKET_NAME,
          Key: key,
        });

        // Pre-sign the command
        const request = await createRequest(this.s3Client, command);
        const signedUrl = formatUrl(await signer.presign(request));
        return signedUrl;
      })
    );
    return signedUrls;
  }

  async deleteFilesFromS3(keys: string[]) {
    try {
      const deletePromises = keys.map((key) => {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: this.S3_USER_PROFILES_BUCKET_NAME,
          Key: key,
        });
        return this.s3Client.send(deleteCommand);
      });
      await Promise.all(deletePromises);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(`파일 삭제에 실패 했습니다 : ${error}`);
    }
  }
}
