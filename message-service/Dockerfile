FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE ${MESSAGE_SERVICE_PORT}
CMD ["npm", "start"]
