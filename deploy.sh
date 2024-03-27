#!/usr/bin/env bash

set -e

REPOSITORY=/home/ec2-user/applications/nowmeet
DEPLOY_NAME=nowmeet-aws-13

echo "> 현재 구동중인 애플리케이션 $DEPLOY_NAME 확인"
CURRENT_DEPLOY="$(/usr/local/bin/pm2 list | grep $DEPLOY_NAME || true)"
echo "$CURRENT_DEPLOY"

if [ -z "$CURRENT_DEPLOY" ]
then
  echo "> 실행중인 해당 애플리케이션이 없습니다. "
else
  echo "> 애플리케이션 종료"
  /usr/local/bin/pm2 stop "$DEPLOY_NAME" || true
  /usr/local/bin/pm2 delete "$DEPLOY_NAME" || true
  sleep 15
fi

echo "> 새 어플리케이션 배포"

echo "> SSM Parameter Store에서 환경 변수 가져오기"

env_vars=(
  AWS
  PROD_AWS_S3_ACCESS_KEY
  AWS_S3_DEPLOY_BUCKET_NAME
  AWS_S3_REGION
  PROD_AWS_S3_SECRET_KEY
  AWS_S3_USER_PROFILES_BUCKET_NAME
  DB_DEV_DATABASE
  DB_PROD_DATABASE
  DB_PROD_HOST
  DB_DEV_HOST
  DB_PASSWORD
  DB_PORT
  DB_USERNAME
  EC2_GOOGLE_LOGIN_CB
  GOOGLE_API_KEY
  GOOGLE_CLIENT_ID
  JWT_EXPIRES
  JWT_KEY
  SEARCH_BOUNDARY
  SWAGGER_PASSWORD
  SWAGGER_USER
  MODE
  LOCAL_IP
  LOCAL_GOOGLE_LOGIN_CB
  PORT
  DEV_AWS_S3_ACCESS_KEY
  DEV_AWS_S3_SECRET_KEY
  AWS_S3_USER_DEV_PROFILES_BUCKET_NAME
  GOOGLE_WEB_CLIENT_ID
  JWKS_URI
  ISSUER
  GOOGLE_WEB_SECRET
  APPLE_TEAM_ID
  APPLE_APP_KEY
  APPLE_CLIENT_ID
)


`mkdir -p "$REPOSITORY"`

> "$REPOSITORY/.env"

# AWS SSM에서 각 환경 변수를 가져와 .env 파일에 추가
for var_name in "${env_vars[@]}"; do
  var_value=$(aws ssm get-parameter --name "/nowmeet/$var_name" --with-decryption --query "Parameter.Value" --output text)
  echo "$var_name=$var_value" >> "$REPOSITORY/.env"
done

echo ".env file written successfully!"

cd "$REPOSITORY"
/usr/local/bin/pm2 start main.js --name $DEPLOY_NAME

