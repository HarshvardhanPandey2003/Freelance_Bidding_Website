FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5000
# FIXED: Use npm start to trigger the OTel instrumentation flag
CMD ["npm", "start"]