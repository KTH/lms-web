const path = require('path')
const express = require('express')
const server = require('kth-node-server')
const bunyan = require('bunyan')
const exphbs  = require('express-handlebars')

const prefix = process.env.PROXY_PREFIX_PATH || ''

const logger = bunyan.createLogger({
  name: 'lms-export-logger',
  app: require('./package.json').name
})

server.engine('handlebars', exphbs({defaultLayout: 'main'}))
server.set('view engine', 'handlebars')

// If you need more routes, replace the following line with a separate Express
// Router object
server.use(prefix + '/kth-style', express.static(path.join(__dirname, 'node_modules/kth-style/dist')))
server.get(prefix, (req, res) => {
  res.render('home', {prefix})
})

server.start({
  logger,
  port: process.env.SERVER_PORT || process.env.PORT || 3000
})
