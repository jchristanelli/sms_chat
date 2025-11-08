FROM node:lts

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8080

CMD ["node", "--loader", "ts-node/esm", "src/server.ts"]
