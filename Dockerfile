FROM kthse/kth-nodejs:9.11.0

COPY ["config", "config"]

COPY ["package.json", "package.json"]
COPY ["package-lock.json", "package-lock.json"]

# Source files
COPY ["app.js", "app.js"]

# Source directories
COPY ["server", "server"]
COPY ["views", "views"]
COPY ["public", "public"]

RUN npm install --production --no-optional
EXPOSE 3001
CMD ["node", "app.js"]
