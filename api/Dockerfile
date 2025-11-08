# Stage 1: Build stage
FROM node:lts AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci
RUN npm install -g ts-node typescript

COPY . .

EXPOSE 8080

CMD ["node", "--loader", "ts-node/esm", "src/server.ts"]

