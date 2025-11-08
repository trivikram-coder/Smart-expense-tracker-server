# ---- BASE ----
FROM node:18-alpine

WORKDIR /app

# Copy entire project
COPY . .

# Install dependencies for all services
RUN npm install -g concurrently

RUN npm install --prefix api-gateway
RUN npm install --prefix auth-service
RUN npm install --prefix budget-service
RUN npm install --prefix expenses-service
RUN npm install --prefix ai-service
RUN npm install --prefix message-service


# Expose only the API Gateway port (Render needs this)
EXPOSE 3000

# Keep container alive and start all services
CMD ["sh", "-c", "\
  concurrently \
  'npm start --prefix api-gateway' \
  'npm start --prefix auth-service' \
  'npm start --prefix budget-service' \
  'npm start --prefix expenses-service' \
  'npm start --prefix ai-service' \
  'npm start --prefix message-service'"]
