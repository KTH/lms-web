require('dotenv').config()
const path = require('path')
const express = require('express')
const server = require('kth-node-server')
const bunyan = require('bunyan')

const publicCourses = require('./server/publicCourses')
const systemCtrl = require('./server/systemCtrl')
const prefix = process.env.PROXY_PREFIX_PATH || '/app/lms-web'
const logger = bunyan.createLogger({
  name: 'lms-export-logger',
  app: require('./package.json').name
})

server.use(prefix + '/kth-style', express.static(path.join(__dirname, 'node_modules/kth-style/build')))
server.use(prefix, systemCtrl)
server.use(prefix + '/static', express.static(path.join(__dirname, 'public')))

// If you need more routes, replace the following line with a separate Express
// Router object
server.get(prefix, async (req, res) => {
  res.status(200)
  res.set('Content-type', 'text/html')
  res.write(publicCourses.getHtml1(req.query.view === 'embed'))

  try {
    logger.info('Getting courses...')
    const courses = await publicCourses.getCourses()
    res.write(publicCourses.getHtml2())

    logger.info('Rendering courses...')
    for (let course of courses) {
      res.write(publicCourses.getHtmlFromCourse(course))
    }
    res.write(publicCourses.getHtml3())
  } catch (e) {
    logger.error('Error getting or rendering courses', e)
  }

  res.write(publicCourses.getHtml4(req.query.view === 'embed'))
  res.end()
})

server.start({
  logger,
  port: process.env.SERVER_PORT || process.env.PORT || 3001
})
