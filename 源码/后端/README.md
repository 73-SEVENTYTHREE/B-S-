### 后端简介

1. 本项目使用的后端框架为`Express.js`，数据库使用的是`MySQL`，同时还使用到了`WebSocket`协议进行全双工通信。

### 运行后端

1. 在运行后端前，您必须在本地安装[`NodeJS`](https://nodejs.org/en/)，并且安装所有依赖包（见前端文件夹中的`package.json`）。
2. 先进入`config`目录下，修改`mysql.js`，使其配置符合你本地的mysql配置。
3. 如果您需要开启邮箱验证码模块，您必须修改`modules/handleUser.js`中`sendSecurityCode`方法中的邮箱配置，开启您邮箱的[SMTP](https://kf.qq.com/touch/faq/160603baeIne160603yaUr2Y.html)服务。

2. 进入`routes`文件夹下，运行命令：`node app.js`，即可将后端运行在本地的5000端口。

