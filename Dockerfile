ARG BASE_IMAGE_ARCH=none
FROM crpi-4pdi7kz96g4v0tg3.cn-beijing.personal.cr.aliyuncs.com/coolxer-studio/nginx:1.25.3-${BASE_IMAGE_ARCH}

# 设置工作目录为Nginx默认的静态资源目录
WORKDIR /usr/share/nginx/html

# 复制 静态资源 到容器中
COPY ./dist /usr/share/nginx/html

# 构建机可能启用严格 umask；确保非 root 的 Nginx worker 可以读取静态资源。
RUN chmod -R a+rX /usr/share/nginx/html

# 设置容器启动命令
CMD ["nginx", "-g", "daemon off;"]

