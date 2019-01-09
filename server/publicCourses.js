const rp = require('request-promise')
const prefix = process.env.PROXY_PREFIX_PATH || '/app/lms-web'
const CanvasApi = require('kth-canvas-api')
const canvasApi = new CanvasApi(process.env.CANVAS_ROOT + '/api/v1', process.env.CANVAS_API_KEY)

let cache

async function fetchCourses() {
  try {
    const courses = (await canvasApi.listCourses())
      .filter(course => course.sis_course_id)

    return courses
  } catch (e) {}
}

function start() {
  const SIX_HOURS = 1000 * 3600 * 6

  setInterval(() => { cache = fetchCourses() }, SIX_HOURS)
  cache = fetchCourses()
}

function getHtmlHeader() {
  return `
    <div id="header" class="header hasPrimaryHeader">
      <div id="primaryHeader" class="primaryHeader">
        <div id="imageLogoBlock">
          <div class="tlc cid-1_77257 no-categories block figure defaultTheme mainLogo">
            <div class="imageWrapper">
              <a href="//kth.se"><img src="//www.kth.se/polopoly_fs/1.77257!/KTH_Logotyp_RGB_2013-2.svg" alt="KTH logo" height="70" width="70"></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

function getHtml1 (embed = false) {
  return `
    <html>
      <head>
        <title>KTH | Open courses in Canvas</title>
        <link rel="shortcut icon" id="favicon" href="//www.kth.se/img/icon/favicon.ico">
        <link rel="stylesheet" href="${prefix}/kth-style/css/kth-bootstrap.css">
        <link rel="stylesheet" href="${prefix}/static/style.css">
      </head>
      <body class="${embed ? 'embedded' : ''}">
        ${embed ? '' : '<div class="container">'}
        ${embed ? '' :  getHtmlHeader()}
        ${embed ? '' : '<hr class="header-hr">'}
        <div class="loading-bar">
          <div class="bar1"></div>
        </div>
  `
}

function getHtml2 () {
  return `
    <table class="table table-hover">
      <thead>
        <tr>
          <th>Course name</th>
          <th>School</th>
          <th>Course code</th>
          <th>Term</th>
          <th>Visibility</th>
        </tr>
      </thead>
      <tbody>
  `
}

function getHtmlFromCourse (course) {
  return `
    <tr>
      <td>
        <a href="https://kth.instructure.com/courses/${course.id}">${course.name}</a>
      </td>
      <td>${course.school}</td>
      <td>${course.course_code}</td>
      <td>${course.term}</td>
      <td>${course.visibility}</td>
    </tr>
  `
}

function getHtml3 () {
  return `
      </tbody>
    </table>
  `
}

function getHtml4 (embed = false) {
  return `
        ${embed ? '' : '</div>'}
        <script>document.querySelector('.loading-bar').classList.add('complete')</script>
      </body>
    </html>
  `
}

async function getCourses () {
  const schools = new Map([
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

  const NOTERM = 'N/A'

  function parseSchool (id) {
    return schools.get(id) || 'KTH'
  }

  function parseTerm (sisId) {
    const regex = /HT\d{2}|VT\d{2}/
    const regexMatches = regex.exec(sisId) || [false]
    return regexMatches[0] || NOTERM
  }

  const format = course => ({
    id: course.id,
    name: course.name,
    school: parseSchool(course.account),
    course_code: course.course_code,
    term: parseTerm(course.sis_course_id),
    visibility: course.is_public ? 'Public' : 'KTH'
  })


  function latestTermFirstSort (a, b) {
    if (a.term === NOTERM) {
      return 1
    } else if (b.term === NOTERM) {
      return -1
    } else {
      let aTermSeason = a.term.slice(0, 2) === 'VT' ? 0 : 1
      let bTermSeason = b.term.slice(0, 2) === 'VT' ? 0 : 1
      let aTermYear = parseInt(a.term.slice(2))
      let bTermYear = parseInt(b.term.slice(2))
      if (aTermYear !== bTermYear) {
        return bTermYear - aTermYear
      } else {
        return bTermSeason - aTermSeason
      }
    }
  }

  if (!cache) {
    cache = fetchCourses()
  }

  const courses = await cache

  return courses
    .filter(c => c.workflow_state === 'available')
    .filter(c => c.is_public || c.is_public_to_auth_users)
    .map(format)
    .sort(latestTermFirstSort)
}

start()

module.exports = {
  getHtml1,
  getHtml2,
  getHtml3,
  getHtml4,
  getHtmlFromCourse,
  getCourses
}
