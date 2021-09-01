const log = require("skog");
const CanvasApi = require("kth-canvas-api");
const intl = require("./translations");
const fakeData = require("./fakeData");

const canvasApi = new CanvasApi(
  process.env.CANVAS_ROOT + "/api/v1",
  process.env.CANVAS_API_KEY
);
const prefix = process.env.PROXY_PREFIX_PATH || "/app/lms-web";

async function fetchCourses() {
  if (
    process.env.NODE_ENV === "development" &&
    process.env.USE_FAKE === "true"
  ) {
    return fakeData;
  }

  try {
    const courses = (await canvasApi.listCourses()).filter(
      (course) => course.sis_course_id
    );

    return courses;
  } catch (e) {
    log.error(e, "Could not fetch courses from Canvas");

    return [];
  }
}

let cache;
function start() {
  const SIX_HOURS = 1000 * 3600 * 6;

  setInterval(() => {
    cache = fetchCourses();
  }, SIX_HOURS);
  cache = fetchCourses();
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
  `;
}

function getHtml1(embed = false, lang = "en") {
  return `
    <html>
      <head>
        <title>KTH | ${intl(lang, "openCoursesInCanvas")}</title>
        <link rel="shortcut icon" id="favicon" href="//www.kth.se/img/icon/favicon.ico">
        <link rel="stylesheet" href="${prefix}/kth-style/css/kth-bootstrap.css">
        <link rel="stylesheet" href="${prefix}/static/style.css">
      </head>
      <body class="${embed ? "embedded" : ""}">
        ${embed ? "" : '<div class="container">'}
        ${embed ? "" : getHtmlHeader()}
        ${embed ? "" : '<hr class="header-hr">'}
        <div class="loading-bar">
          <div class="bar1"></div>
        </div>
  `;
}

function getHtml2(lang = "en") {
  return `
    <table class="table table-hover">
      <thead>
        <tr>
          <th class="sort" data-field="name">${intl(lang, "courseName")}</th>
          <th class="sort" data-field="school">${intl(lang, "school")}</th>
          <th class="sort" data-field="course_code">${intl(
            lang,
            "courseCode"
          )}</th>
          <th class="sort" data-field="term">${intl(lang, "term")}</th>
          <th class="sort" data-field="visibility">${intl(
            lang,
            "visibility"
          )}</th>
        </tr>
      </thead>
      <tbody id="table-body">
  `;
}

function getHtmlFromCourse(course) {
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
  `;
}

function getHtml3() {
  return `
      </tbody>
    </table>
  `;
}

function getHtml4(embed = false, courses = []) {
  return `
        ${embed ? "" : "</div>"}
        <script>document.querySelector('.loading-bar').classList.add('complete')</script>
        <script>window.courses = ${JSON.stringify(courses)}</script>
        <script src="${prefix}/static/public-courses.js"></script>
      </body>
    </html>
  `;
}

async function getCourses() {
  const schools = new Map([
    [14, "ABE"], // "ABE" in Canvas
    [17, "CBH"], // "BIO" in Canvas
    [22, "CBH"], // "CHE" in Canvas
    [23, "EECS"], // "CSC" in Canvas
    [24, "ITM"], // "ECE" in Canvas
    [25, "EECS"], // "EES" in Canvas
    [26, "EECS"], // "ICT" in Canvas
    [27, "ITM"], // "ITM" in Canvas
    [28, "SCI"], // "SCI" in Canvas
    [29, "CBH"], // "CHE" in Canvas
    [59, "EECS"], // "EECS" in Canvas
    [63, "CBH"], // "CBH" in Canvas
    [67, "GVS"], // "GVS" in Canvas
  ]);

  const NOTERM = "N/A";

  function parseSchool(id) {
    return schools.get(id) || "KTH";
  }

  function parseTerm(sisId) {
    const regex = /HT\d{2}|VT\d{2}/;
    const regexMatches = regex.exec(sisId) || [false];
    return regexMatches[0] || NOTERM;
  }

  const format = (course) => ({
    id: course.id,
    name: course.name,
    school: parseSchool(course.account_id),
    course_code: course.course_code,
    term: parseTerm(course.sis_course_id),
    visibility: course.is_public ? "Public" : "KTH",
  });

  function latestTermFirstSort(a, b) {
    if (a.term === NOTERM) {
      return 1;
    }
    if (b.term === NOTERM) {
      return -1;
    }
    const aTermSeason = a.term.slice(0, 2) === "VT" ? 0 : 1;
    const bTermSeason = b.term.slice(0, 2) === "VT" ? 0 : 1;
    const aTermYear = parseInt(a.term.slice(2), 10);
    const bTermYear = parseInt(b.term.slice(2), 10);
    if (aTermYear !== bTermYear) {
      return bTermYear - aTermYear;
    }
    return bTermSeason - aTermSeason;
  }

  function isRecent(course) {
    const sortableTerm = course.term.slice(0, 2) === "VT" ? "0" : "1";
    const sortableYear = course.term.slice(2);
    const sortableYearTerm = parseInt(sortableYear + sortableTerm, 10);

    const limitTerm = new Date().getMonth() < 6 ? "0" : "1";
    const limitYear = (new Date().getFullYear() - 2).toString(10).slice(2);

    const limitYearTerm = parseInt(limitYear + limitTerm, 10);

    return sortableYearTerm >= limitYearTerm;
  }

  if (!cache) {
    cache = fetchCourses();
  }

  const courses = await cache;

  return courses
    .filter((c) => c.workflow_state === "available")
    .filter((c) => c.is_public || c.is_public_to_auth_users)
    .map(format)
    .filter(isRecent)
    .sort(latestTermFirstSort);
}

start();

module.exports = {
  getHtml1,
  getHtml2,
  getHtml3,
  getHtml4,
  getHtmlFromCourse,
  getCourses,
};
