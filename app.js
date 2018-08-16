require('dotenv').config()
const path = require('path')
const express = require('express')
const server = require('kth-node-server')
const bunyan = require('bunyan')
const exphbs  = require('express-handlebars')
const getPublicCourses = require('./server/publicCourses')

const prefix = process.env.PROXY_PREFIX_PATH || ''

const logger = bunyan.createLogger({
  name: 'lms-export-logger',
  app: require('./package.json').name
})

server.engine('handlebars', exphbs({defaultLayout: 'main'}))
server.set('view engine', 'handlebars')

// If you need more routes, replace the following line with a separate Express
// Router object
server.use(prefix + '/kth-style', express.static(path.join(__dirname, 'node_modules/kth-style/build')))
server.get(prefix, async (req, res) => {
  const courses = await getPublicCourses()
  res.render('home', {
    courses,
    prefix
  })
})

server.start({
  logger,
  port: process.env.SERVER_PORT || process.env.PORT || 3000
})
