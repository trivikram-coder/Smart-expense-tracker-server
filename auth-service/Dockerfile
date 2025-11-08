FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE ${AUTH_SERVICE_PORT}
CMD ["npm", "start"]
