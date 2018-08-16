const server = require('kth-node-server')
const bunyan = require('bunyan')
const logger = bunyan.createLogger({
  name: 'lms-export-logger',
  app: require('./package.json').name
})

// If you need more routes, replace the following line with a separate Express
// Router object
server.get(process.env.PROXY_PREFIX_PATH || '', (req, res) => {
  res.send('Hello World')
})

server.start({
  logger,
  port: process.env.SERVER_PORT || process.env.PORT || 3000
})
