FROM node:18-alpine
WORKDIR /app

# Install dependencies
COPY backend/package.json backend/package-lock.json ./
RUN npm ci

# Copy source
COPY . .

EXPOSE 4000
CMD ["npm", "start"]