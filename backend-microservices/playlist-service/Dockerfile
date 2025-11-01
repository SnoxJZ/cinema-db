FROM node:22-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY package.json ./
COPY pnpm-lock.yaml* ./
RUN pnpm install
COPY . .
EXPOSE 8004
CMD ["pnpm", "start"]