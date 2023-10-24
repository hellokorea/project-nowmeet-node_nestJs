#!/usr/bin/env bash

set -e
set -x

REPOSITORY=/home/ec2-user/applications/nowmeet
APP_NAME=nowmeet

echo "> 현재 구동중인 애플리케이션 pid 확인"
CURRENT_PID=$(pgrep -f $APP_NAME)
echo "$CURRENT_PID"

if [ -z $CURRENT_PID ]
then
  echo "> 실행중인 해당 애플리케이션이 없습니다. "
else
  echo "> 애플리케이션 종료"
  pm2 stop $APP_NAME
  sleep 10
fi

echo "> 새 어플리케이션 배포"

# AWS CLI 및 SSM이 정상적으로 설치되어 있는지 확인
if ! command -v aws &> /dev/null
then
    echo "AWS CLI could not be found. Please install it first."
    exit 1
fi

echo "> SSM Parameter Store에서 환경 변수 가져오기"
#
AWS=$(aws ssm get-parameter --name "/nowmeet/AWS" --query "Parameter.Value" --output text)
AWS_S3_ACCESS_KEY=$(aws ssm get-parameter --name "/nowmeet/AWS_S3_ACCESS_KEY" --with-decryption --query "Parameter.Value" --output text)
AWS_S3_DEPLOY_BUCKET_NAME=$(aws ssm get-parameter --name "/nowmeet/AWS_S3_DEPLOY_BUCKET_NAME" --query "Parameter.Value" --output text)
AWS_S3_REGION=$(aws ssm get-parameter --name "/nowmeet/AWS_S3_REGION" --with-decryption --query "Parameter.Value" --output text)
AWS_S3_SECRET_KEY=$(aws ssm get-parameter --name "/nowmeet/AWS_S3_SECRET_KEY" --query "Parameter.Value" --output text)
AWS_S3_USER_PROFILES_BUCKET_NAME=$(aws ssm get-parameter --name "/nowmeet/AWS_S3_USER_PROFILES_BUCKET_NAME" --with-decryption --query "Parameter.Value" --output text)
DB_DATABASE=$(aws ssm get-parameter --name "/nowmeet/DB_DATABASE" --with-decryption --query "Parameter.Value" --output text)
DB_HOST=$(aws ssm get-parameter --name "/nowmeet/DB_HOST" --query "Parameter.Value" --output text)
DB_PASSWORD=$(aws ssm get-parameter --name "/nowmeet/DB_PASSWORD" --with-decryption --query "Parameter.Value" --output text)
DB_PORT=$(aws ssm get-parameter --name "/nowmeet/DB_PORT" --query "Parameter.Value" --output text)
DB_USERNAME=$(aws ssm get-parameter --name "/nowmeet/DB_USERNAME" --query "Parameter.Value" --output text)
EC2_GOOGLE_LOGIN_CB=$(aws ssm get-parameter --name "/nowmeet/EC2_GOOGLE_LOGIN_CB" --with-decryption --query "Parameter.Value" --output text)
GOOGLE_API_KEY=$(aws ssm get-parameter --name "/nowmeet/GOOGLE_API_KEY" --query "Parameter.Value" --output text)
GOOGLE_CLIENT_ID=$(aws ssm get-parameter --name "/nowmeet/GOOGLE_CLIENT_ID" --with-decryption --query "Parameter.Value" --output text)
JWT_EXPIRES=$(aws ssm get-parameter --name "/nowmeet/JWT_EXPIRES" --query "Parameter.Value" --output text)
JWT_KEY=$(aws ssm get-parameter --name "/nowmeet/JWT_KEY" --with-decryption --query "Parameter.Value" --output text)
SEARCH_BOUNDARY=$(aws ssm get-parameter --name "/nowmeet/SEARCH_BOUNDARY" --query "Parameter.Value" --output text)
SWAGGER_PASSWORD=$(aws ssm get-parameter --name "/nowmeet/SWAGGER_PASSWORD" --with-decryption --query "Parameter.Value" --output text)
SWAGGER_USER=$(aws ssm get-parameter --name "/nowmeet/SWAGGER_USER" --with-decryption --query "Parameter.Value" --output text)

# 해당 REPOSITORY 디렉토리가 있는지 확인하고 없으면 생성
mkdir -p $REPOSITORY

# 환경 변수를 .env 파일에 저장
echo "AWS=$AWS" > $REPOSITORY/.env
echo "AWS_S3_ACCESS_KEY=$AWS_S3_ACCESS_KEY" >> $REPOSITORY/.env
echo "AWS_S3_DEPLOY_BUCKET_NAME=$AWS_S3_DEPLOY_BUCKET_NAME" >> $REPOSITORY/.env
echo "AWS_S3_REGION=$AWS_S3_REGION" >> $REPOSITORY/.env
echo "AWS_S3_SECRET_KEY=$AWS_S3_SECRET_KEY" >> $REPOSITORY/.env
echo "AWS_S3_USER_PROFILES_BUCKET_NAME=$AWS_S3_USER_PROFILES_BUCKET_NAME" >> $REPOSITORY/.env
echo "DB_DATABASE=$DB_DATABASE" >> $REPOSITORY/.env
echo "DB_HOST=$DB_HOST" >> $REPOSITORY/.env
echo "DB_PASSWORD=$DB_PASSWORD" >> $REPOSITORY/.env
echo "DB_PORT=$DB_PORT" >> $REPOSITORY/.env
echo "DB_USERNAME=$DB_USERNAME" >> $REPOSITORY/.env
echo "EC2_GOOGLE_LOGIN_CB=$EC2_GOOGLE_LOGIN_CB" >> $REPOSITORY/.env
echo "GOOGLE_API_KEY=$GOOGLE_API_KEY" >> $REPOSITORY/.env
echo "GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID" >> $REPOSITORY/.env
echo "JWT_EXPIRES=$JWT_EXPIRES" >> $REPOSITORY/.env
echo "JWT_KEY=$JWT_KEY" >> $REPOSITORY/.env
echo "SEARCH_BOUNDARY=$SEARCH_BOUNDARY" >> $REPOSITORY/.env
echo "SWAGGER_PASSWORD=$SWAGGER_PASSWORD" >> $REPOSITORY/.env
echo "SWAGGER_USER=$SWAGGER_USER" >> $REPOSITORY/.env

cd $REPOSITORY
npm run start:ec2 # 앱 production 환경으로 실행
#pm2 start $APP_ENTRY --name $APP_NAME
