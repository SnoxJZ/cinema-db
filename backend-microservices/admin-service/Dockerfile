FROM node:22-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY package.json ./
COPY pnpm-lock.yaml* ./
RUN pnpm install
COPY . .
EXPOSE 8005
CMD ["pnpm", "start"]