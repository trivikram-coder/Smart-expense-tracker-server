FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE ${API_GATEWAY_PORT}
CMD ["npm", "start"]
