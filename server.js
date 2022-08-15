const mongoose = require("mongoose")
const dotenv = require("dotenv")
//order of dotenv.config({ path: "./config.env" }) matters
//it should be define before app = require("./app")
// eslint-disable-next-line prettier/prettier
dotenv.config({ path: "./config.env" })

process.on("uncaughtException", err => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...")
  console.log(err.name, err.message)
  process.exit(1)
})

const DB_URL = process.env.DB_CONNECTION_URL.replace(
  "<PASSWORD>",
  process.env.DB_PASSWORD
)

mongoose
  .connect(DB_URL, {
    useNewUrlParser: true
  })
  .then(() => {
    console.log("Database connected")
  })
  .catch(error => {
    console.log("Database connection error", error)
  })

const app = require("./app")

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port: ${process.env.PORT}`)
})

process.on("unhandledRejection", err => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...")
  console.log(err.name, err.message)
  server.close(() => {
    process.exit(1)
  })
})
