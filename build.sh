#!/bin/bash
IMAGE_NAME="crpi-4pdi7kz96g4v0tg3.cn-beijing.personal.cr.aliyuncs.com/coolxer-studio/zenvis-frontend"
IMAGE_TAG="latest"
DATE_TAG=$(date +%Y%m%d)

echo "========== 开始构建zenvis-frontend项目 =========="

echo "1. 执行 yarn 打包..."
    yarn build:pro
if [ $? -ne 0 ]; then
    echo "yarn 打包失败!"
    exit 1
fi

echo "2. yarn 打包成功!"

echo "3. 构建 Docker 镜像..."
docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:${DATE_TAG} .

if [ $? -ne 0 ]; then
    echo "Docker 构建失败!"
    exit 1
fi

echo "4. Docker 镜像构建成功!"
echo "镜像名称: ${IMAGE_NAME}:${IMAGE_TAG}"
echo "日期标签: ${IMAGE_NAME}:${DATE_TAG}"

echo "5. 推送镜像到 Docker Registry..."
docker push ${IMAGE_NAME}:${IMAGE_TAG}
docker push ${IMAGE_NAME}:${DATE_TAG}
echo "6. 镜像推送成功!"