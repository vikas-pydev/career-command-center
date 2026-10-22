# Stage 1: Build client and prepare dependencies
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci && cd client && npm ci

# Copy full source
COPY . .

# Build client React application
RUN npm run build:client

# Stage 2: Production runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Copy built artifacts and server files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server ./server
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/*.xlsx ./
COPY --from=builder /app/*.docx ./
COPY --from=builder /app/tests ./tests

EXPOSE 3001

CMD ["npm", "run", "server"]
