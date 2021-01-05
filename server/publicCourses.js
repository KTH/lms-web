const log = require('skog')
const prefix = process.env.PROXY_PREFIX_PATH || '/app/lms-web'
const CanvasApi = require('kth-canvas-api')
const canvasApi = new CanvasApi(process.env.CANVAS_ROOT + '/api/v1', process.env.CANVAS_API_KEY)

let cache

async function fetchCourses() {
  if (process.env.NODE_ENV === 'development' && process.env.USE_FAKE === 'true') {
    return [
      {id: 3, sis_course_id: 'ExampleHT18', account_id: 14, workflow_state: 'available', course_code: 'H', is_public: true, name: 'Example course I HT18'},
      {id: 3, sis_course_id: 'ExampleVT18', account_id: 14, workflow_state: 'available', course_code: 'B', is_public: true, name: 'Example course II VT18'},
      {id: 3, sis_course_id: 'ExampleHT18', account_id: 24, workflow_state: 'available', course_code: 'G', is_public: true, name: 'Example course III HT18'},
      {id: 3, sis_course_id: 'ExampleHT16', account_id: 24, workflow_state: 'available', course_code: 'E', is_public: true, name: 'Example course IV HT16'},
      {id: 3, sis_course_id: 'Blablablabl', account_id: 67, workflow_state: 'available', course_code: 'C', is_public: true, name: 'Example course nowhere'},
      {id: 3, sis_course_id: 'ExampleVT17', account_id: 27, workflow_state: 'available', course_code: 'D', is_public: true, name: 'Example course V VT17'},
      {id: 3, sis_course_id: 'ExampleHT17', account_id: 29, workflow_state: 'available', course_code: 'F', is_public: true, name: 'Example course VI HT18'},
      {id: 3, sis_course_id: 'ExampleHT18', account_id: 63, workflow_state: 'available', course_code: 'A', is_public: true, name: 'Example course VII HT18'},
      {id: 3, sis_course_id: 'ExampleHT18', account_id: 67, workflow_state: 'available', course_code: 'C', is_public: true, name: 'Example course VIII HT18'},
      {id: 3, sis_course_id: 'ExampleHT19', account_id: 24, workflow_state: 'available', course_code: 'C', is_public: true, name: 'Example course XI HT19'},
      {id: 3, sis_course_id: 'ExampleVT20', account_id: 27, workflow_state: 'available', course_code: 'C', is_public: true, name: 'Example course XII VT20'},
      {id: 3, sis_course_id: 'ExampleHT20', account_id: 29, workflow_state: 'available', course_code: 'C', is_public: true, name: 'Example course XIII HT20'},
      {id: 3, sis_course_id: 'ExampleVT21', account_id: 14, workflow_state: 'available', course_code: 'C', is_public: true, name: 'Example course XIV VT21'},
    ]
  }

  try {
    const courses = (await canvasApi.listCourses())
      .filter(course => course.sis_course_id)

    return courses
  } catch (e) {
    log.error(e, 'Could not fetch courses from Canvas')
  }
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
          <th class="sort" data-field="name">Course name</th>
          <th class="sort" data-field="school">School</th>
          <th class="sort" data-field="course_code">Course code</th>
          <th class="sort" data-field="term">Term</th>
          <th class="sort" data-field="visibility">Visibility</th>
        </tr>
      </thead>
      <tbody id="table-body">
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

function getHtml4 (embed = false, courses = []) {
  return `
        ${embed ? '' : '</div>'}
        <script>document.querySelector('.loading-bar').classList.add('complete')</script>
        <script>window.courses = ${JSON.stringify(courses)}</script>
        <script src="${prefix}/static/public-courses.js"></script>
      </body>
    </html>
  `
}

async function getCourses () {
  const schools = new Map([
    [14, 'ABE'],  // "ABE" in Canvas
    [17, 'CBH'],  // "BIO" in Canvas
    [22, 'CBH'],  // "CHE" in Canvas
    [23, 'EECS'], // "CSC" in Canvas
    [24, 'ITM'],  // "ECE" in Canvas
    [25, 'EECS'], // "EES" in Canvas
    [26, 'EECS'], // "ICT" in Canvas
    [27, 'ITM'],  // "ITM" in Canvas
    [28, 'SCI'],  // "SCI" in Canvas
    [29, 'CBH'],  // "CHE" in Canvas
    [59, 'EECS'], // "EECS" in Canvas
    [63, 'CBH'],  // "CBH" in Canvas
    [67, 'GVS']   // "GVS" in Canvas
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
    school: parseSchool(course.account_id),
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

  function isRecent (course) {
    const sortableTerm = course.term.slice(0, 2) === 'VT' ? "0" : "1"
    const sortableYear = course.term.slice(2)
    const sortableYearTerm = parseInt(sortableYear + sortableTerm, 10)


    const limitTerm = (new Date()).getMonth() < 6 ? "0" : "1"
    const limitYear = ((new Date()).getFullYear() - 2).toString(10).slice(2)

    const limitYearTerm = parseInt(limitYear + limitTerm, 10);

    return sortableYearTerm >= limitYearTerm;
  }

  if (!cache) {
    cache = fetchCourses()
  }

  const courses = await cache

  return courses
    .filter(c => c.workflow_state === 'available')
    .filter(c => c.is_public || c.is_public_to_auth_users)
    .map(format)
    .filter(isRecent)
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
