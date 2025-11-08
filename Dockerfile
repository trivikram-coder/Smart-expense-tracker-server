FROM node:20

WORKDIR /app

# Copy everything (each folder has its own package.json and .env)
COPY . .

# Install global utility to run several services at once
RUN npm install -g concurrently

# Install production deps for each service
RUN npm ci --omit=dev --prefix ai-service
RUN npm ci --omit=dev --prefix auth-service
RUN npm ci --omit=dev --prefix budget-service
RUN npm ci --omit=dev --prefix expenses-service
RUN npm ci --omit=dev --prefix message-service
RUN npm ci --omit=dev --prefix api-gateway

# Let the container expose whatever ports the env files define
# (Render only uses the port from the gateway anyway)
ARG AI_GATEWAY_PORT
ARG AI_SERVICE_PORT
ARG AUTH_SERVICE_PORT
ARG BUDGET_SERVICE_PORT
ARG EXPENSES_SERVICE_PORT
ARG MESSAGE_SERVICE_PORT
ARG OTP_SERVICE_PORT

EXPOSE ${AI_GATEWAY_PORT}
EXPOSE ${AI_SERVICE_PORT}
EXPOSE ${AUTH_SERVICE_PORT}
EXPOSE ${BUDGET_SERVICE_PORT}
EXPOSE ${EXPENSES_SERVICE_PORT}
EXPOSE ${MESSAGE_SERVICE_PORT}
EXPOSE ${OTP_SERVICE_PORT}

# Start every service using its own .env values
CMD ["sh", "-c", "\
  concurrently \
  'cd ai-service && npm start' \
  'cd auth-service && npm start' \
  'cd budget-service && npm start' \
  'cd expenses-service && npm start' \
  'cd message-service && npm start' \
  'cd api-gateway && npm start' \
"]
