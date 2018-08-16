const rp = require('request-promise')

module.exports = async function () {
  const courses = await rp({
    method: 'GET',
    uri: `${process.env.LMS_API_ROOT}/courses`,
    json: true
  })
  console.log(Object.values(courses).filter(c => c.is_public).length)

  return Object.values(courses)
    .filter(c => c.is_public)
}
