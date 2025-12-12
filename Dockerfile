FROM oven/bun:1.3.4

WORKDIR /app

COPY package.json bun.lock bunfig.toml ./

RUN bun install

COPY src ./src

ENV NODE_ENV=production

EXPOSE 3000

CMD ["bun", "run", "--watch", "src/index.ts"]
