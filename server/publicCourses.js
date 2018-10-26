const rp = require('request-promise')

module.exports = async function () {
  const courses = await rp({
    method: 'GET',
    uri: `${process.env.LMS_API_ROOT}/api/courses`,
    json: true
  })

  // ToDo: workflow_state can be either 'unpublished', 'available', 'completed', or 'deleted' - what do we want?
  return Object.values(courses)
    .filter(c => c.workflow_state === 'available' &&
    (c.is_public || c.is_public_to_auth_users))
}
