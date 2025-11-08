FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# Expose the port that vite preview uses by default
EXPOSE 4173

CMD ["npm", "run", "preview-and-expose"]