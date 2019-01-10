/**
 * Routes for System Control (monitor, etc…)
 */
const rp = require('request-promise')
const express = require('express')
const packageFile = require('../package.json')
const version = require('../config/version')
const router = express.Router()
const log = require('bunyan').createLogger({
  name: 'lms-web-logger',
  app: packageFile.name
})
const CanvasApi = require('kth-canvas-api')
const canvasApi = new CanvasApi(process.env.CANVAS_ROOT + '/api/v1', process.env.CANVAS_API_KEY)

async function checkCanvasKey () {
  try {
    await canvasApi.getRootAccount()
    return true
  } catch (e) {
    log.info('An error ocurred: ', e)
    return false
  }
}

async function checkCanvasStatus () {
  try {
    const canvasStatus = await rp({
      url: 'https://nlxv32btr6v7.statuspage.io/api/v2/status.json',
      json: true
    })
    return canvasStatus.status.indicator === 'none'
  } catch (e) {
    log.info('An error occured:', e)
    return false
  }
}

async function _monitor (req, res) {
  const status = await checkCanvasKey()
  const statusStr = [
    `APPLICATION_STATUS: ${status ? 'OK' : 'ERROR'}`,
    '',
    `CANVAS_KEY: ${status ? 'OK' : 'ERROR. Token for Canvas is not properly set'}`
  ].join('\n')

  log.info('Showing _monitor page:', statusStr)
  res.setHeader('Content-Type', 'text/plain')
  res.send(statusStr)
}

async function _monitorAll (req, res) {
  const canvasStatus = await checkCanvasStatus()
  const canvasKeyStatus = await checkCanvasKey()

  const statusStr = [
    `APPLICATION_STATUS: ${canvasStatus && canvasKeyStatus ? 'OK' : 'ERROR'}`,
    '',
    `CANVAS_KEY: ${canvasKeyStatus ? 'OK' : 'ERROR. Token for Canvas is not properly set'}`,
    `CANVAS: ${canvasStatus ? 'OK' : 'ERROR. CANVAS is down'}`
  ].join('\n')

  log.info('Showing _monitor_all page:', statusStr)

  res.setHeader('Content-Type', 'text/plain')
  res.send(statusStr)
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
router.get('/_monitor', _monitor)
router.get('/_monitor_all', _monitorAll)
router.get('/_monitor_core', (req, res) => {
  res.setHeader('Content-Type', 'text/plain')
  res.send(`APPLICATION_STATUS: OK`)
})

module.exports = router
