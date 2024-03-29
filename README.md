# LMS Web

Tiny web application that displays public courses available in Canvas.

## Getting started

This project requires NodeJS >= 8.

Clone the repository and install the dependencies

```sh
$ npm install
```

### Set the environmental variables

You need two environmental variables:

- `CANVAS_ROOT`: endpoint where [Canvas] is deployed (e.g. `https://kth.instructure.com/`)
- `CANVAS_API_KEY`: API key to access to Canvas.

Optionally you can set an `.env` file with those variables and put it in the root directory of the project. They will be read on startup.

### Start the application

Once you have installed the dependencies and set the enviromental variables, start the app with

```sh
$ npm start
```

It will start a web server in the port 3001. Go to http://localhost:3001/app/lms-web

---

# Development

## How it works

The app exposes a single endpoint, `/`. It fetches the courses from [lms-api], and renders only the public ones using a [handlebars] template. This page is suitable for embedding.

The app generates links to the courses in Canvas

## More configuration

You can set the following environmental variables to configure more the application:

- `NODE_ENV`: set to `development` or `production` based on the correct context of deployment (default `production`)
- `PORT` and `PROXY_PREFIX_PATH` (default `3001` and `/app/lms-web` respectively). Start the app in different port and endpoint. Make sure that `PROXY_PREFIX_PATH` hasn't any trailing slashes.
- `USE_FAKE`: set to `true` to run with fake data instead of importing from production. Set to `true` by default when running `npm run dev` or `npm run debug`.

## Auto-restart the app

In development environments, you can start the app with `npm run dev` and it will start the app with `nodemon` using fake data.

## Logging

The logs in the app are output structured in JSON using [Skog]. You can use the `pino-pretty` to pretty-print the logs.

```sh
$ npm start | npx pino-pretty -e options,response
```

[canvas]: https://github.com/instructure/canvas-lms
[lms-api]: https://github.com/KTH/lms-api
[skog]: https://github.com/KTH/skog
[handlebars]: https://github.com/wycats/handlebars.js/
