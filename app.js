const server = require('kth-node-server')
const bunyan = require('bunyan')
const logger = bunyan.createLogger({
  name: 'lms-export-logger',
  app: require('./package.json').name
})

server.start({
  logger,
  port: process.env.SERVER_PORT || process.env.PORT || 3000
})
