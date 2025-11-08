FROM node:lts-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build the Vue/Vuetify app for production
RUN npm run build

# Serve via simple static server - you can use any lightweight server or serve from backend if preferred
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
