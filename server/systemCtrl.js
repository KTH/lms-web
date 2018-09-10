/**
 * Routes for System Control (monitor, etc…)
 */

const express = require('express')
const rp = require('request-promise')
const packageFile = require('../package.json')
const version = require('../config/version')
const router = express.Router()
const log = require('bunyan').createLogger({
  name: 'lms-web-logger',
  app: packageFile.name
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

/**
 * GET /_about
 * About page
 */
async function about (req, res) {
  res.setHeader('Content-Type', 'text/plain')
  res.send(`
    packageFile.name:${packageFile.name}
    packageFile.name:${packageFile.name}
    packageFile.version:${packageFile.version}
    packageFile.description:${packageFile.description}
    version.gitBranch:${version.gitBranch}
    version.gitCommit:${version.gitCommit}
    version.jenkinsBuild:${version.jenkinsBuild}
    version.dockerName:${version.dockerName}
    version.dockerVersion:${version.dockerVersion}
    version.jenkinsBuildDate:${version.jenkinsBuildDate}`)
}

router.get('/_about', about)
router.get('/_monitor', getMonitor)
router.get('/_monitor_core', (req, res) => {
  res.setHeader('Content-Type', 'text/plain')
  res.send(`APPLICATION_STATUS: OK`)
})

module.exports = router
