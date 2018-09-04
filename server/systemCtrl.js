/**
 * Routes for System Control (monitor, etc…)
 */

const express = require('express')
const rp = require('request-promise')
const router = express.Router()
const log = require('bunyan').createLogger({
  name: 'lms-web-logger',
  app: require('../package.json').name
})

async function checkApi () {
  return rp({
    method: 'GET',
    uri: `${process.env.LMS_API_ROOT}/_monitor`,
  })
}

/**
 * GET /_monitor
 * Monitor page
 */
async function getMonitor (req, res) {
  try {
    log.debug('Start preparing monitor')

    await checkApi()
    log.info('Done collecting monitor results: OK')
    res.type('text')
      .status(200)
      .send(`APPLICATION_STATUS: OK`)
  } catch (err) {
    log.error('Failed to display status page:', err)
    res.type('text').status(500).send('APPLICATION_STATUS ERROR\n')
  }
}

router.get('/_monitor', getMonitor)
router.get('/_monitor_core', (req, res) => {
  res.setHeader('Content-Type', 'text/plain')
  res.send(`APPLICATION_STATUS: OK`)
})

module.exports = router
