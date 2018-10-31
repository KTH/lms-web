require('dotenv').config()
const path = require('path')
const express = require('express')
const server = require('kth-node-server')
const bunyan = require('bunyan')
const exphbs = require('express-handlebars')
const getPublicCourses = require('./server/publicCourses')
const systemCtrl = require('./server/systemCtrl')
const prefix = process.env.PROXY_PREFIX_PATH || '/app/lms-web'
const logger = bunyan.createLogger({
  name: 'lms-export-logger',
  app: require('./package.json').name
})
const schoolMap = new Map([
  [14, 'ABE'],
  [17, 'CBH'],
  [22, 'CBH'],
  [23, 'EECS'],
  [24, 'ITM'],
  [25, 'EECS'],
  [26, 'EECS'],
  [27, 'ITM'],
  [28, 'SCI'],
  [29, 'CBH']
])

server.engine('handlebars', exphbs({defaultLayout: 'main'}))
server.set('view engine', 'handlebars')

// If you need more routes, replace the following line with a separate Express
// Router object
server.use(prefix + '/kth-style', express.static(path.join(__dirname, 'node_modules/kth-style/build')))
server.use(prefix, systemCtrl)
server.use(prefix + '/static', express.static(path.join(__dirname, 'public')))

server.get(prefix, async (req, res) => {
  try {
    logger.info('Getting courses...')
    const courses = await getPublicCourses()
    logger.info('Rendering courses...')
    res.render('home', {
      courses,
      prefix,
      layout: req.query.view === 'embed' ? 'embed' : 'main',
      canvas_root: process.env.CANVAS_ROOT,
      helpers: {
        parseSchool: (id) => schoolMap.get(id) || 'KTH',
        parseTerm: (sisId) => {
          let regex = /HT\d{2}|VT\d{2}/
          return regex.exec(sisId) || 'N/A'
        }
      }
    })
  } catch (e) {
    res.render('home', {courses: []})
  }
})

server.start({
  logger,
  port: process.env.SERVER_PORT || process.env.PORT || 3001
})
