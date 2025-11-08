# Use Node for all microservices
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files if you have a root package.json (for docker compose, not needed)
COPY package*.json ./

# Copy all files
COPY . .

# Install dependencies for each service
RUN npm install --prefix api-gateway
RUN npm install --prefix auth-service
RUN npm install --prefix budget-service
RUN npm install --prefix expenses-service
RUN npm install --prefix ai-service
RUN npm install --prefix message-service
RUN npm install --prefix otp-service

# Expose only API Gateway port
EXPOSE 10000

# Start all services using concurrently
RUN npm install -g concurrently

CMD concurrently \
  "npm start --prefix api-gateway" \
  "npm start --prefix auth-service" \
  "npm start --prefix budget-service" \
  "npm start --prefix expenses-service" \
  "npm start --prefix ai-service" \
  "npm start --prefix message-service" \
  "npm start --prefix otp-service"
