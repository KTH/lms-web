FROM node:10-alpine

COPY ["config", "config"]

COPY ["package.json", "package.json"]
COPY ["package-lock.json", "package-lock.json"]

# Source files
COPY [".env.in", ".env.in"]
COPY ["app.js", "app.js"]

# Source directories
COPY ["server", "server"]
COPY ["public", "public"]

RUN npm ci --production
EXPOSE 3001
CMD ["node", "app.js"]
