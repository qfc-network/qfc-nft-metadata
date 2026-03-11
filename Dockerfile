FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY tsconfig.json ./
COPY src/ ./src/
RUN npx tsc
EXPOSE 3285
CMD ["node", "dist/index.js"]
