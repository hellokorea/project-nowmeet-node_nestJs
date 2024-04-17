/// <reference types="multer" />
import { ConfigService } from "@nestjs/config";
export declare class AwsService {
    private readonly configService;
    private readonly s3Client;
    readonly S3_USER_PROFILES_BUCKET_NAME: string;
    readonly S3_DEPLOY_BUCKET_NAME: string;
    readonly S3_USER_DEV_PROFILES_BUCKET_NAME: string;
    constructor(configService: ConfigService);
    uploadFilesToS3(folder: string, files: Array<Express.Multer.File>): Promise<{
        key: string;
        s3Object: import("@aws-sdk/client-s3").PutObjectCommandOutput;
        contentType: string;
    }[]>;
    createPreSignedUrl(keys: string[]): Promise<string[]>;
    deleteFilesFromS3(keys: string[]): Promise<void>;
}
