#!/usr/bin/env bash

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
  sleep 5
fi

echo "> 새 어플리케이션 배포"

# Node.js 어플리케이션의 엔트리 포인트 (예: main.js 또는 app.js)
APP_ENTRY=$REPOSITORY/main.js

pm2 start $APP_ENTRY --name $APP_NAME