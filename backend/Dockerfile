FROM oven/bun:1.1.13-alpine

WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile
COPY . .
COPY wait-for.sh /wait-for.sh
RUN chmod +x /wait-for.sh

CMD ["/wait-for.sh", "db:5432", "--", "bun", "run", "start"]
