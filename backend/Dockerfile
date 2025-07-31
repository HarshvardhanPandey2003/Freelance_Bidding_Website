# Single stage since backend doesn't need building
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production  # ✅ Backend only needs runtime deps
COPY . .
EXPOSE 5000
CMD ["node", "src/server.js"]
