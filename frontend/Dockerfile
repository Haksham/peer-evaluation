# Stage 1: install & build
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: run
FROM node:18-alpine
WORKDIR /app

ENV NODE_ENV=production

# Copy build output and deps
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY frontend/package.json ./

EXPOSE 3000
CMD ["npm", "start"]
