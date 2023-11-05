import { consts } from '../constants/consts'
import AppError from '../utils/appError'
import { createHash } from 'crypto'
import catchAsync from '../utils/catchAsync'
import User from './../models/userModel'
import { sign, verify } from 'jsonwebtoken'
import { promisify } from 'util'
import { Email } from '../utils/email'

const signToken = (id) => {
  return sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}

const cookieOptions = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  ),
  httpOnly: true,
}

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id)

  if (process.env.NODE_ENV === consts.MODE.PROD) cookieOptions.secure = true
  res.cookie('jwt', token, cookieOptions)

  user.password = undefined

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  })
}

export const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body)
  const url = `${req.protocol}://${req.get('host')}/me`

  await new Email(newUser, url).sendWelcome()

  createAndSendToken(newUser, 201, res)
})

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400))
  }
  const user = await User.findOne({ email }).select('+password')

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401))
  }

  createAndSendToken(user, 200, res)
})

export const logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  })
  res.status(200).json({
    status: 'success',
  })
})

export const protect = catchAsync(async (req, res, next) => {
  const { authorization } = req.headers
  let token

  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1]
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    )
  }

  const decodedPayload = await promisify(verify)(token, process.env.JWT_SECRET)

  const currentUser = await User.findById(decodedPayload.id)
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exists.',
        401
      )
    )
  }
  if (currentUser.changedPasswordAfter(decodedPayload.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    )
  }

  req.user = currentUser
  res.locals.user = currentUser
  next()
})

export const isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decodedPayload = await promisify(verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      )

      const currentUser = await User.findById(decodedPayload.id)
      if (!currentUser) {
        return next()
      }
      if (currentUser.changedPasswordAfter(decodedPayload.iat)) {
        return next()
      }

      res.locals.user = currentUser
      return next()
    } catch {
      return next()
    }
  }
  next()
}

export function restrictTo(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      )
    }
    next()
  }
}

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body

  const user = await User.findOne({ email })

  if (!user) {
    return next(new AppError('There is no user with that email address', 404))
  }

  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })

  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/reset-password/${resetToken}`

    await new Email(user, resetURL).sendPasswordReset()

    res.status(200).json({
      status: 'success',
      message: 'Token send to email!',
    })
  } catch (error) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    )
  }
})

export const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params
  const { password, passwordConfirm } = req.body
  const hashedToken = createHash('sha256').update(token).digest('hex')

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  })

  if (!user) {
    return next(new AppError('Token is invalid or has expired.', 400))
  }

  user.password = password
  user.passwordConfirm = passwordConfirm
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()

  createAndSendToken(user, 200, res)
})

export const updatePassword = catchAsync(async (req, res, next) => {
  const { id } = req.user
  const { passwordCurrent, password, passwordConfirm } = req.body

  const user = await User.findById(id).select('+password')

  if (!user.correctPassword(passwordCurrent, user.password)) {
    next(new AppError('Your current password is wrong', 401))
  }

  user.password = password
  user.passwordConfirm = passwordConfirm
  await user.save()
  createAndSendToken(user, 200, res)
})
