FROM oven/bun:1.1.13-alpine

WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile
COPY . .
EXPOSE 3003

CMD [ "bun", "run", "dev"]