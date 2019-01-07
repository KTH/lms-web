const rp = require('request-promise')
const helpers = require('./helpers')
const prefix = process.env.PROXY_PREFIX_PATH || '/app/lms-web'


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
          <div class="bar2"></div>
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
      <td>${helpers.parseSchool(course.account)}</td>
      <td>${course.course_code}</td>
      <td>${helpers.parseTerm(course.sis_course_id)}</td>
      <td>xxx</td>
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

function latestTermFirstSort (a, b) {
  let aTerm = helpers.parseTerm(a.sis_course_id)
  let bTerm = helpers.parseTerm(b.sis_course_id)
  if (aTerm === helpers.NOTERM) {
    return 1
  } else if (bTerm === helpers.NOTERM) {
    return -1
  } else {
    let aTermSeason = aTerm.slice(0, 2) === 'VT' ? 0 : 1
    let bTermSeason = bTerm.slice(0, 2) === 'VT' ? 0 : 1
    let aTermYear = parseInt(aTerm.slice(2))
    let bTermYear = parseInt(bTerm.slice(2))
    if (aTermYear !== bTermYear) {
      return bTermYear - aTermYear
    } else {
      return bTermSeason - aTermSeason
    }
  }
}

async function getCourses () {
  const courses = await rp({
    method: 'GET',
    uri: `${process.env.LMS_API_ROOT}/api/courses`,
    json: true
  })

  return Object.values(courses)
    .filter(c => c.workflow_state === 'available')
    .filter(c => c.is_public || c.is_public_to_auth_users)
    .sort(latestTermFirstSort)
}

module.exports = {
  getHtml1,
  getHtml2,
  getHtml3,
  getHtml4,
  getHtmlFromCourse,
  getCourses
}
