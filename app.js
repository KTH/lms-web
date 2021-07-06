const log = require("skog");

require("skog/bunyan").createLogger({
  app: require("./package.json").name,
  name: require("./package.json").name,
  level:
    process.env.NODE_ENV === "development"
      ? "trace"
      : process.env.LOG_LEVEL || "info",
  serializers: require("bunyan").stdSerializers,
});

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
const publicCourses = require("./server/publicCourses");
const systemCtrl = require("./server/systemCtrl");

const prefix = process.env.PROXY_PREFIX_PATH || "/app/lms-web";

server.use(
  prefix + "/kth-style",
  express.static(path.join(__dirname, "node_modules/kth-style/build"))
);
server.use(prefix, systemCtrl);
server.use(prefix + "/static", express.static(path.join(__dirname, "public")));

// If you need more routes, replace the following line with a separate Express
// Router object
server.get(prefix, async (req, res) => {
  res.status(200);
  res.set("Content-type", "text/html");
  res.write(publicCourses.getHtml1(req.query.view === "embed"));

  let courses;

  try {
    log.info("Getting courses...");
    courses = await publicCourses.getCourses();
    res.write(publicCourses.getHtml2());

    log.info("Rendering courses...");
    for (const course of courses) {
      res.write(publicCourses.getHtmlFromCourse(course));
    }
    res.write(publicCourses.getHtml3());
  } catch (e) {
    log.error("Error getting or rendering courses", e);
  }

  res.write(publicCourses.getHtml4(req.query.view === "embed", courses));
  res.end();
});

server.start({
  logger: log,
  port: process.env.SERVER_PORT || process.env.PORT || 3001,
});
