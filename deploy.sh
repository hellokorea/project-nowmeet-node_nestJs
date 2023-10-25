#!/usr/bin/env bash
set -e

REPOSITORY=/home/ec2-user/applications/nowmeet
DEPLOY_NAME=nowmeet-aws


echo "> 현재 구동중인 애플리케이션 pid 확인"
CURRENT_PID=$(pgrep -f $DEPLOY_NAME || true)
echo "$CURRENT_PID"

if [ -z $CURRENT_PID ]
then
  echo "> 실행중인 해당 애플리케이션이 없습니다. "
else
  echo "> 애플리케이션 종료"
  pm2 stop $DEPLOY_NAME || true
  sleep 10
fi

echo "> 새 어플리케이션 배포"

echo "> SSM Parameter Store에서 환경 변수 가져오기"
#
AWS=$(aws ssm get-parameter --name "/nowmeet/AWS" --query "Parameter.Value" --output text)
AWS_S3_ACCESS_KEY=$(aws ssm get-parameter --name "/nowmeet/AWS_S3_ACCESS_KEY" --with-decryption --query "Parameter.Value" --output text)
AWS_S3_DEPLOY_BUCKET_NAME=$(aws ssm get-parameter --name "/nowmeet/AWS_S3_DEPLOY_BUCKET_NAME" --query "Parameter.Value" --output text)
AWS_S3_REGION=$(aws ssm get-parameter --name "/nowmeet/AWS_S3_REGION" --with-decryption --query "Parameter.Value" --output text)
AWS_S3_SECRET_KEY=$(aws ssm get-parameter --name "/nowmeet/AWS_S3_SECRET_KEY" --query "Parameter.Value" --output text)
AWS_S3_USER_PROFILES_BUCKET_NAME=$(aws ssm get-parameter --name "/nowmeet/AWS_S3_USER_PROFILES_BUCKET_NAME" --with-decryption --query "Parameter.Value" --output text)
DB_DATABASE=$(aws ssm get-parameter --name "/nowmeet/DB_DATABASE" --with-decryption --query "Parameter.Value" --output text)
DB_PROD_HOST=$(aws ssm get-parameter --name "/nowmeet/DB_PROD_HOST" --query "Parameter.Value" --output text)
DB_DEV_HOST=$(aws ssm get-parameter --name "/nowmeet/DB_DEV_HOST" --query "Parameter.Value" --output text)
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
MODE=$(aws ssm get-parameter --name "/nowmeet/MODE" --with-decryption --query "Parameter.Value" --output text)
LOCAL_IP=$(aws ssm get-parameter --name "/nowmeet/LOCAL_IP" --with-decryption --query "Parameter.Value" --output text)
LOCAL_GOOGLE_LOGIN_CB=$(aws ssm get-parameter --name "/nowmeet/LOCAL_GOOGLE_LOGIN_CB" --with-decryption --query "Parameter.Value" --output text)
PORT=$(aws ssm get-parameter --name "/nowmeet/PORT" --with-decryption --query "Parameter.Value" --output text)

# 해당 REPOSITORY 디렉토리가 있는지 확인하고 없으면 생성
mkdir -p $REPOSITORY


# 환경 변수를 .env 파일에 저장
echo "Current directory: $(pwd)"
echo "Writing to .env file..."
echo "Creating .env file in: $REPOSITORY/.env"
echo "AWS=$AWS" > $REPOSITORY/.env
echo "AWS_S3_ACCESS_KEY=$AWS_S3_ACCESS_KEY" >> $REPOSITORY/.env
echo "AWS_S3_DEPLOY_BUCKET_NAME=$AWS_S3_DEPLOY_BUCKET_NAME" >> $REPOSITORY/.env
echo "AWS_S3_REGION=$AWS_S3_REGION" >> $REPOSITORY/.env
echo "AWS_S3_SECRET_KEY=$AWS_S3_SECRET_KEY" >> $REPOSITORY/.env
echo "AWS_S3_USER_PROFILES_BUCKET_NAME=$AWS_S3_USER_PROFILES_BUCKET_NAME" >> $REPOSITORY/.env
echo "DB_DATABASE=$DB_DATABASE" >> $REPOSITORY/.env
echo "DB_PROD_HOST=$DB_PROD_HOST" >> $REPOSITORY/.env
echo "DB_DEV_HOST=$DB_DEV_HOST" >> $REPOSITORY/.env
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
echo "MODE=$MODE" >> $REPOSITORY/.env
echo "LOCAL_IP=$LOCAL_IP" >> $REPOSITORY/.env
echo "LOCAL_GOOGLE_LOGIN_CB=$LOCAL_GOOGLE_LOGIN_CB" >> $REPOSITORY/.env
echo "PORT=$PORT" >> $REPOSITORY/.env

echo ".env file written successfully!"

cd $REPOSITORY
pm2 start main.js --name $DEPLOY_NAME
