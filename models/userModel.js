/* eslint-disable node/no-unsupported-features/es-syntax */
const { Schema, model } = require("mongoose")
const isEmail = require("validator/lib/isEmail")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")

const userSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "User name must be available"]
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true,
    validate: [isEmail, "Email is not valid"],
    required: [true, "Email must be available"]
  },
  password: {
    type: String,
    select: false,
    minlength: [8, "A password must have greater or equal t0 20 characters"],
    maxlength: [20, "A password must have less or equal t0 20 characters"],
    required: [true, "Please provide a valid password"],
    validate: {
      validator: function(password) {
        return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(password)
      },
      message:
        "password should contain at least one numeric digit, one uppercase, and one lowercase letter,"
    }
  },
  active: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ["user", "manager"],
    default: "user"
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpireAt: Date
})

userSchema.pre("save", async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next()
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.pre("save", async function(next) {
  // Only run this function if password was actually updated
  if (!this.isModified("password") || !this.isNew) return next()

  // update the password changed at properties
  this.passwordChangedAt = Date.now() - 1000
  next()
})

userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } })
  next()
})

userSchema.methods.isCorrectPassword = async function(password, hashPassword) {
  return await bcrypt.compare(password, hashPassword)
}

userSchema.methods.isChangedPasswordAfterJWTCreation = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    )
    return JWTTimestamp < changedTimestamp
  }
  return false
}

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString("hex")
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")
  this.passwordResetTokenExpireAt =
    Date.now() + process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN * 60 * 1000
  return resetToken
}

const User = model("User", userSchema)

module.exports = User
