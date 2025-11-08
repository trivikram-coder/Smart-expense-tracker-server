FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE ${AI_SERVICE_PORT}
CMD ["npm", "start"]
