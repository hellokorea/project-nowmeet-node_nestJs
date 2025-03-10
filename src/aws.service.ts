import * as path from "path";
import * as sharp from "sharp";
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
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
    this.S3_USER_PROFILES_BUCKET_NAME = this.configService.get("AWS_S3_USER_PROFILES_BUCKET_NAME"); //*
    this.S3_DEPLOY_BUCKET_NAME = this.configService.get("AWS_S3_DEPLOY_BUCKET_NAME");
    //& dev
    this.S3_USER_DEV_PROFILES_BUCKET_NAME = this.configService.get("AWS_S3_USER_DEV_PROFILES_BUCKET_NAME");
  }

  async uploadFilesToS3(folder: string, files: Array<Express.Multer.File>) {
    try {
      const uploadPromises = files.map(async (file) => {
        const imgResizingBuffer = await sharp(file.buffer)
          .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();

        const key = `${folder}/${Date.now()}_${path.basename(file.originalname)}`.replace(/ /g, "");

        const putCommand = new PutObjectCommand({
          Bucket: this.S3_USER_PROFILES_BUCKET_NAME, //*
          Key: key,
          Body: imgResizingBuffer,
          ContentType: "image/webp",
        });

        const s3Object = await this.s3Client.send(putCommand);
        return { key, s3Object, contentType: "image/webp" };
      });

      return Promise.all(uploadPromises);
    } catch (e) {
      console.error("uploadFilesToS3", e);
      throw new BadRequestException(`파일 업로드에 실패 했습니다 : ${e}`);
    }
  }

  async createPreSignedUrl(keys: string[]) {
    const signer = new S3RequestPresigner({
      ...this.s3Client.config,
    });

    if (!keys.length) {
      throw new BadRequestException("프로필 이미지가 비어있습니다.");
    }

    try {
      const signedUrls = await Promise.all(
        keys.map(async (key) => {
          if (key === "undefined") {
            return "undefined";
          }

          const command = new GetObjectCommand({
            Bucket: this.S3_USER_PROFILES_BUCKET_NAME, //*
            Key: key,
          });

          // Pre-sign the command
          const request = await createRequest(this.s3Client, command);
          const signedUrl = formatUrl(await signer.presign(request));
          return signedUrl;
        })
      );
      return signedUrls;
    } catch (e) {
      console.error("createPreSignedUrl :", e);
      throw new InternalServerErrorException("S3 사전 서명 URL을 생성하는데 실패했습니다.");
    }
  }

  async deleteFilesFromS3(keys: string[]) {
    try {
      const deletePromises = keys.map((key) => {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: this.S3_USER_PROFILES_BUCKET_NAME, //*
          Key: key,
        });
        return this.s3Client.send(deleteCommand);
      });
      await Promise.all(deletePromises);
    } catch (e) {
      console.error("deleteFilesFromS3 :", e);
      throw new BadRequestException(`파일 삭제에 실패 했습니다 : ${e}`);
    }
  }
}
