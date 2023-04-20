FROM node:14.19.3
# 将根目录下的文件都copy到container（运行此镜像的容器）文件系统的app文件夹下
ADD . /app/
# cd到 前端 文件夹下
WORKDIR /app/pt-fe
# 安装项目依赖包
RUN npm install
# 打包静态资源
RUN npm run build
WORKDIR /app
RUN mv pt-fe/build/ pt-server/public/pt-web/
RUN rm -rf pt-fe
# cd到 后端 文件夹下
WORKDIR /app/pt-server
# 安装项目依赖包
RUN npm install
# 容器对外暴露的端口号
EXPOSE 39909
# 容器启动时执行的命令，类似npm run start
CMD ["npm", "start"]
