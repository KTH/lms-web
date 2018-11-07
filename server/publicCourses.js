const rp = require('request-promise')
const helpers = require('./helpers')

function latestTermFirstSort (a, b) {
  let aTerm = helpers.parseTerm(a.sis_course_id)
  let bTerm = helpers.parseTerm(b.sis_course_id)
  if (aTerm === helpers.NOTERM) {
    return -1
  } else if (bTerm === helpers.NOTERM) {
    return 1
  } else {
    let aTermSeason = aTerm.slice(0, 2)
    let bTermSeason = bTerm.slice(0, 2)
    let aTermYear = parseInt(aTerm.slice(2))
    let bTermYear = parseInt(bTerm.slice(2))
    if (aTermYear !== bTermYear) {
      return bTermYear - aTermYear
    } else {
      return aTermSeason - bTermSeason
    }
  }
}

module.exports = async function () {
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
