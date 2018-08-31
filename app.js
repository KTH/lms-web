require('dotenv').config()
const path = require('path')
const express = require('express')
const server = require('kth-node-server')
const bunyan = require('bunyan')
const exphbs  = require('express-handlebars')
const getPublicCourses = require('./server/publicCourses')
const systemCtrl = require('./server/systemCtrl')

const prefix = process.env.PROXY_PREFIX_PATH || '/app/lms-web'

const logger = bunyan.createLogger({
  name: 'lms-export-logger',
  app: require('./package.json').name
})

server.engine('handlebars', exphbs({defaultLayout: 'main'}))
server.set('view engine', 'handlebars')

// If you need more routes, replace the following line with a separate Express
// Router object
server.use(prefix + '/kth-style', express.static(path.join(__dirname, 'node_modules/kth-style/build')))
server.use(prefix, systemCtrl)
server.get(prefix, async (req, res) => {
  try {
    logger.info('Getting courses...')
    const courses = await getPublicCourses()
    logger.info('Rendering courses...')
    res.render('home', {
      courses,
      prefix,
      layout: req.query.view === 'embed' ? 'embed' : 'main',
      canvas_root: process.env.CANVAS_ROOT
    })
  } catch (e) {
    res.render('home', {courses: []})
  }
})

server.start({
  logger,
  port: process.env.SERVER_PORT || process.env.PORT || 3001
})
