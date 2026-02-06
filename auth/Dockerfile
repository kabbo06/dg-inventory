# STAGE 1: Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./

# Use 'npm install' or 'npm ci' for production builds
RUN npm install

# Copy source code (Includes app.js and server.js)
COPY . .

# STAGE 2: Runtime Stage
FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /app

# SECURITY: Create a non-root user
RUN addgroup -S authgroup && adduser -S authuser -G authgroup

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/app.js ./app.js
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/package.json ./package.json

RUN chown -R authuser:authgroup /app

USER authuser

EXPOSE 4000

# Use 'node' directly for better SIGTERM handling in K8s
CMD ["node", "server.js"]
