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
  const t = await rp({
    method: 'GET',
    uri: `${process.env.LMS_API_ROOT}/_monitor`,
  })
  return {'ok': true, msg: 'lms api works'}
}

/**
 * GET /_monitor
 * Monitor page
 */
async function getMonitor (req, res) {
  try {
    log.debug('Start preparing monitor')

    const status = await checkApi()
    log.info('Done collecting monitor results', status.ok)
    res.type('text')
      .status(200)
      .send(`APPLICATION_STATUS: ${status.ok ? 'OK' : 'ERROR'} ${status.msg}`)
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
