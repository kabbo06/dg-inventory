# STAGE 1: Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./

# Use 'npm install' or 'npm ci' for production builds
RUN npm install

# Copy the rest of the source code
COPY . .

# STAGE 2: Runtime Stage
FROM node:20-alpine

# Set to production to optimize Node performance
ENV NODE_ENV=production

WORKDIR /app

# SECURITY: Create a dedicated non-root user and group
RUN addgroup -S invgroup && adduser -S invuser -G invgroup

# Copy ONLY necessary files from the builder stage
# This keeps the image size small and secure
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/package.json ./package.json

# SECURITY: Ensure the non-root user owns the app directory
RUN chown -R invuser:invgroup /app

# Switch to the restricted user
USER invuser

# Match the port defined in backend/server.js
EXPOSE 5000

# Use 'node' directly for proper signal handling (SIGTERM) in K8s
CMD ["node", "server.js"]

