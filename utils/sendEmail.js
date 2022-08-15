/* eslint-disable node/no-unsupported-features/es-syntax */
const nodemailer = require("nodemailer")

const sendEmail = async options => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  })

  await transporter.sendMail({
    from: `Natours <${process.env.EMAIL_FROM}>`, // sender address
    ...options
  })
}

module.exports = sendEmail
