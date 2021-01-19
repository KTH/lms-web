const translations = {
  en: {
    courseName: 'Course name',
    school: 'School',
    courseCode: 'Course code',
    visibility: 'Visibility',
    openCoursesInCanvas: 'Open courses in Canvas'
  },
  sv: {
    courseName: 'Kursnamn',
    school: 'Skola',
    courseCode: 'Kurskod',
    visibility: 'Synlighet',
    openCoursesInCanvas: 'Öppna kurser i Canvas'
  }
}

function intl (lang, input) {
  return translations[lang][input]
}

module.exports = intl
