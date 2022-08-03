const { default: log, initializeLogger, setFields } = require("skog");

initializeLogger();
setFields({ app: "lms-web" });

process.on("uncaughtException", (err) => {
  log.fatal(err, "Uncaught Exception thrown");
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  throw reason;
});
require("dotenv-safe").config({ example: ".env.in" });

const path = require("path");
const express = require("express");
const server = require("kth-node-server");
const {
  generatePageTemplate,
  generateTableBody,
  generateCourseSnippet,
  getCourses,
} = require("./server/publicCourses");
const systemCtrl = require("./server/systemCtrl");

const prefix = process.env.PROXY_PREFIX_PATH || "/app/lms-web";

server.use(
  prefix + "/kth-style",
  express.static(path.join(__dirname, "node_modules/kth-style/dist"))
);
server.use(prefix, systemCtrl);
server.use(prefix + "/static", express.static(path.join(__dirname, "public")));

// If you need more routes, replace the following line with a separate Express
// Router object
server.get(prefix, async (req, res) => {
  let courses;
  const lang = req.query.lang || "en";

  res.status(200);
  res.set("Content-type", "text/html");

  // Get and generate course HTML
  const coursesHtml = [];
  try {
    log.info("Getting courses...");
    courses = await getCourses();

    log.info("Rendering courses...");
    for (const course of courses) {
      coursesHtml.push(generateCourseSnippet(course));
    }
  } catch (e) {
    log.error("Error getting or rendering courses", e);
  }

  // Create content body
  const pageContent = generateTableBody(coursesHtml.join("\n"), lang);

  // Create content page
  res.write(generatePageTemplate(pageContent, courses, lang));
  res.end();
});

server.start({
  logger: log,
  port: process.env.SERVER_PORT || process.env.PORT || 3001,
});
