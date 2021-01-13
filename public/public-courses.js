// Catch the "click" events
// Trigger sort in different ways
let sortField = ''
let sortDirection = null

function updateTable () {
  const alphabeticSorter = (field, direction) => (a, b) => {
    return direction === 'ASC'
      ? a[field].localeCompare(b[field])
      : b[field].localeCompare(a[field])
  }

  const termSorter = (field, direction) => (a, b) => {
    const yearA = parseInt(a[field].slice(2), 10)
    const yearB = parseInt(b[field].slice(2), 10)

    if (isNaN(yearA)) {
      return 1
    } else if (isNaN(yearB)) {
      return -1
    }

    const diff = yearA - yearB

    if (diff !== 0) {
      return direction === 'ASC' ? diff : -diff
    }

    const aSeason = a[field].slice(0, 2) === 'VT' ? 0 : 1
    const bSeason = b[field].slice(0, 2) === 'VT' ? 0 : 1

    return direction === 'ASC' ? aSeason - bSeason : bSeason - aSeason
  }

  const sortFunction = sortField === 'term' ? termSorter : alphabeticSorter
  const html = window.courses
    .concat()
    .sort(sortFunction(sortField, sortDirection))
    .map(
      (course) => `
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
    )
    .join('')

  document.querySelector('#table-body').innerHTML = html
}

document.querySelectorAll('.sort').forEach(function (element) {
  element.onclick = function () {
    const field = element.getAttribute('data-field')

    if (sortField === field) {
      sortDirection = sortDirection === 'ASC' ? 'DESC' : 'ASC'
    } else {
      sortField = field
      sortDirection = 'ASC'
    }

    document.querySelectorAll('.sort').forEach((element) => {
      element.className = 'sort'
    })
    element.className = `sort ${
      sortDirection === 'ASC' ? 'sort-asc' : 'sort-desc'
    }`

    updateTable()
  }
})
