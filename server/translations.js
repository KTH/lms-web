const translations = {
  en: {
    courseName: 'Course name',
    school: 'School',
    courseCode: 'Course code',
    visibility: 'Visibility',
    openCoursesInCanvas: 'Open courses in Canvas',
    term: 'Term'
  },
  sv: {
    courseName: 'Kursnamn',
    school: 'Skola',
    courseCode: 'Kurskod',
    visibility: 'Synlighet',
    openCoursesInCanvas: 'Öppna kurser i Canvas',
    term: 'Termin'
  }
}

function intl (lang, input) {
  return translations[lang][input]
}

module.exports = intl
