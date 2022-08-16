// /* eslint-disable node/no-unsupported-features/es-syntax */
const AppError = require("../utils/appError")

const handleMongoDBCastError = err => {
  const message = `Invalid ${err.path}: ${err.value}.`
  return new AppError(message, 400)
}

const handleMongoDBValidationError = err => {
  // eslint-disable-next-line node/no-unsupported-features/es-builtins
  const errors = Object.values(err.errors).map(el => el.message)
  const message = `Invalid input data. ${errors.join(". ")}`
  return new AppError(message, 400)
}

const handleMongoDBDuplicateFieldsError = err => {
  const value = Object.keys(err.keyValue).join(",")
  const message = `Duplicate field value: [${value}]. Please use another value`
  return new AppError(message, 400)
}

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401)

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401)

const sendProductionError = (err, res) => {
  if (err.isOperational)
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    })
  else {
    console.log("Error:", err)
    res.status(500).json({
      status: "error",
      message: "Something went wrong which is not operational"
    })
  }
}

const sendDevelopmentError = (err, res) => {
  console.log("sendDevelopmentError", err.name)
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  })
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || "error"
  if (process.env.NODE_ENV === "production") {
    let error = JSON.parse(JSON.stringify(err))
    if (error.name === "CastError") error = handleMongoDBCastError(error)
    if (error.name === "ValidationError")
      error = handleMongoDBValidationError(error)
    if (error.code === 11000) error = handleMongoDBDuplicateFieldsError(error)
    if (error.name === "JsonWebTokenError") error = handleJWTError()
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError()
    sendProductionError(error, res)
  } else sendDevelopmentError(err, res)
}
