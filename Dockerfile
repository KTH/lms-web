FROM node:8.9-wheezy

RUN mkdir -p /npm && \
    mkdir -p /application

# We do this to avoid npm install when we're only changing code
WORKDIR /npm

COPY ["package-lock.json", "package-lock.json"]
COPY ["package.json", "package.json"]
RUN npm install --production --no-optional

# Add the code and copy over the node_modules-catalog
WORKDIR /application
RUN cp -a /npm/node_modules /application && \
    rm -rf /npm

# Copy source files
COPY ["app.js", "app.js"]
COPY ["server", "server"]
COPY ["views", "views"]

# Copy again package.json, used by server/systemCtrl.js
COPY ["package.json", "package.json"]

ENV NODE_PATH /application

EXPOSE 3001

CMD ["node", "app.js"]
