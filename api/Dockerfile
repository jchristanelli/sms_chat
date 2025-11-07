# Stage 1: Build stage
FROM node:lts AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy all source files
COPY . .

# Build TypeScript code
RUN npm run build

# Stage 2: Production stage
FROM node:lts-slim

WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --production

# Copy built js from build stage
COPY --from=builder /app/build ./build

# Expose backend port
EXPOSE 3000

# Run the compiled JS
CMD ["node", "build/index.js"]
