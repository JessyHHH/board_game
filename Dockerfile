FROM --platform=linux/amd64 node:22.19-alpine3.21

RUN mkdir -p /data/code/mono
WORKDIR /data/code/mono

RUN npm install -g pm2

COPY package.json .
COPY dist ./dist
COPY .env.debug ./
COPY ecosystem.config.js .

RUN npm install

EXPOSE 3001

# 随便一个命令 别让容器退出(阻塞)
CMD pm2-runtime ecosystem.config.js --env=$ENVIRONMENT
