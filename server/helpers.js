const SCHOOLMAP = new Map([
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
  return SCHOOLMAP.get(id) || 'KTH'
}

function parseTerm (sisId) {
  const regex = /HT\d{2}|VT\d{2}/
  const regexMatches = regex.exec(sisId) || [false]
  return regexMatches[0] || NOTERM
}

module.exports = {
  NOTERM,
  parseSchool,
  parseTerm
}
