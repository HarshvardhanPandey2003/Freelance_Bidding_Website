# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
# Copy package files
COPY package*.json ./
RUN npm ci
# Copy source code (excluding .env via .dockerignore)
COPY . .
# Build without .env file - will use default/placeholder values
RUN npm run build

# Production stage - Use nginx instead of node
FROM nginx:alpine
# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy custom nginx config for SPA routing instead of writing it in Dockerfile
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]



# Old Dockerfile using Node.js server
# Build stage
# FROM node:18-alpine AS builder
# WORKDIR /app

# # Copy package files
# COPY package*.json ./
# RUN npm ci

# # Copy source code (excluding .env via .dockerignore)
# COPY . .

# # Build without .env file - will use default/placeholder values
# RUN npm run build

# # Production stage
# FROM node:18-alpine
# WORKDIR /app

# # Copy package files and install production dependencies
# COPY package*.json ./
# RUN npm ci --only=production

# # Copy built files and server
# COPY --from=builder /app/dist ./dist
# COPY server.js ./server.js

# EXPOSE 3000
# CMD ["node", "server.js"]
