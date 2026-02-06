# STAGE 1: Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# STAGE 2: Runtime Stage
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S invgroup && adduser -S invuser -G invgroup

# Copy ONLY necessary files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/app.js ./app.js
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/package.json ./package.json

RUN chown -R invuser:invgroup /app
USER invuser
EXPOSE 5000
CMD ["node", "server.js"]
