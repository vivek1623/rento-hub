const express = require("express")
const morgan = require("morgan")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const mongoSanitize = require("express-mongo-sanitize")
const xss = require("xss-clean")
// const hpp = require("hpp")
const path = require("path")


const app = express()

//------------- GLOBAL MIDDLEWARE -------------

// Helmet helps you secure your Express apps by setting various HTTP headers
app.use(helmet())

//Limit api call request
app.use(
  "/api",
  rateLimit({
    windowMs: 10 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: "Too many requests from this IP, please try again in an hour!"
  })
)

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}

/*
 * Express.json is middleware
 * Which modify the incoming data
 * All req will go through this middleware
 * This middleware will add data.body into req object
 * Body parser, reading data from body into req.body
 */
app.use(express.json({ limit: "10Kb" }))

// Data sanitization against NoSQL query injection
// To remove data using these defaults:
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss())

// Prevent parameter pollution
// app.use(
//   hpp({
//     whitelist: [
//       "duration",
//       "ratingsQuantity",
//       "ratingsAverage",
//       "maxGroupSize",
//       "difficulty",
//       "price"
//     ]
//   })
// )

// Serving static files
app.use(express.static(path.join(__dirname, "public")))

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  // console.log(req.headers);
  next()
})


// below routes are equivalent to above commented routes

// app.use("/api/v1/users", userRouter)

// app.all("*", (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
// })

// app.use(errorController)

module.exports = app
