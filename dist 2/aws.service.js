"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsService = void 0;
const path = require("path");
const sharp = require("sharp");
const client_s3_1 = require("@aws-sdk/client-s3");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const util_create_request_1 = require("@aws-sdk/util-create-request");
const util_format_url_1 = require("@aws-sdk/util-format-url");
let AwsService = class AwsService {
    constructor(configService) {
        this.configService = configService;
        this.s3Client = new client_s3_1.S3Client({
            credentials: {
                accessKeyId: this.configService.get("PROD_AWS_S3_ACCESS_KEY"),
                secretAccessKey: this.configService.get("PROD_AWS_S3_SECRET_KEY"),
            },
            region: this.configService.get("AWS_S3_REGION"),
        });
        this.S3_USER_PROFILES_BUCKET_NAME = this.configService.get("AWS_S3_USER_PROFILES_BUCKET_NAME");
        this.S3_DEPLOY_BUCKET_NAME = this.configService.get("AWS_S3_DEPLOY_BUCKET_NAME");
        this.S3_USER_DEV_PROFILES_BUCKET_NAME = this.configService.get("AWS_S3_USER_DEV_PROFILES_BUCKET_NAME");
    }
    async uploadFilesToS3(folder, files) {
        try {
            const uploadPromises = files.map(async (file) => {
                const imgResizingBuffer = await sharp(file.buffer)
                    .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toBuffer();
                const key = `${folder}/${Date.now()}_${path.basename(file.originalname)}`.replace(/ /g, "");
                const putCommand = new client_s3_1.PutObjectCommand({
                    Bucket: this.S3_USER_PROFILES_BUCKET_NAME,
                    Key: key,
                    Body: imgResizingBuffer,
                    ContentType: "image/webp",
                });
                const s3Object = await this.s3Client.send(putCommand);
                return { key, s3Object, contentType: "image/webp" };
            });
            return Promise.all(uploadPromises);
        }
        catch (e) {
            console.error("uploadFilesToS3", e);
            throw new common_1.BadRequestException(`파일 업로드에 실패 했습니다 : ${e}`);
        }
    }
    async createPreSignedUrl(keys) {
        const signer = new s3_request_presigner_1.S3RequestPresigner({
            ...this.s3Client.config,
        });
        if (!keys.length) {
            throw new common_1.BadRequestException("프로필 이미지가 비어있습니다.");
        }
        try {
            const signedUrls = await Promise.all(keys.map(async (key) => {
                if (key === "undefined") {
                    return "undefined";
                }
                const command = new client_s3_1.GetObjectCommand({
                    Bucket: this.S3_USER_PROFILES_BUCKET_NAME,
                    Key: key,
                });
                const request = await (0, util_create_request_1.createRequest)(this.s3Client, command);
                const signedUrl = (0, util_format_url_1.formatUrl)(await signer.presign(request));
                return signedUrl;
            }));
            return signedUrls;
        }
        catch (e) {
            console.error("createPreSignedUrl :", e);
            throw new common_1.InternalServerErrorException("S3 사전 서명 URL을 생성하는데 실패했습니다.");
        }
    }
    async deleteFilesFromS3(keys) {
        try {
            const deletePromises = keys.map((key) => {
                const deleteCommand = new client_s3_1.DeleteObjectCommand({
                    Bucket: this.S3_USER_PROFILES_BUCKET_NAME,
                    Key: key,
                });
                return this.s3Client.send(deleteCommand);
            });
            await Promise.all(deletePromises);
        }
        catch (e) {
            console.error("deleteFilesFromS3 :", e);
            throw new common_1.BadRequestException(`파일 삭제에 실패 했습니다 : ${e}`);
        }
    }
};
exports.AwsService = AwsService;
exports.AwsService = AwsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AwsService);
//# sourceMappingURL=aws.service.js.map