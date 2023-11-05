import { consts } from '../constants/consts'
import AppError from '../utils/appError'

const sendErrorDev = (error, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(error.statusCode).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: error.stack,
    })
  }
  return res.status(error.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: error.message,
  })
}

const sendErrorProd = (error, req, res) => {
  console.log(req.originalUrl)
  if (req.originalUrl.startsWith('/api')) {
    if (error.isOperational) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      })
    }
    console.error('ERROR: ', error)
    return res.status(500).json({
      status: 'error',
      msg: 'Please try again later.',
    })
  }
  if (error.isOperational) {
    console.log(error.message)
    return res.status(error.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: error.message,
    })
  }
  console.error('ERROR: ', error)
  return res.status(error.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  })
}

const handleCastError = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`
  return new AppError(message, 400)
}

const handleDuplicateFieldsDB = (error) => {
  const value = Object.values(error.keyValue)[0]
  const message = `Duplicate field value: ${value}. Please use another value!`
  return new AppError(message, 400)
}

const handleValidationErrorDB = (error) => {
  const errors = Object.values(error.errors).map((error) => error.message)
  const message = `Invalid input data. ${errors.join('. ')}`
  return new AppError(message, 400)
}

const handleJsonWebTokenError = () => {
  const message = 'Invalid Token. Please log in again!'
  return new AppError(message, 401)
}

const handleTokenExpiredError = () => {
  const message = 'Your token has expired! Please log in again!'
  return new AppError(message, 401)
}

export default (error, req, res, next) => {
  error.statusCode = error.statusCode ?? 500
  error.status = error.status ?? 'error'

  if (process.env.NODE_ENV === consts.MODE.DEV) {
    sendErrorDev(error, req, res)
  } else if (process.env.NODE_ENV === consts.MODE.PROD) {
    let newError = { ...error }
    newError.message = error.message

    const { name, code } = newError

    if (name === consts.ERRORS.CAST_ERROR) {
      newError = handleCastError(newError)
    }
    if (code === consts.ERRORS.DUPLICATE_FIELD) {
      newError = handleDuplicateFieldsDB(newError)
    }
    if (name === consts.ERRORS.VALIDATION_ERROR) {
      newError = handleValidationErrorDB(newError)
    }
    if (name === consts.ERRORS.JSON_WEBTOKEN_ERROR) {
      newError = handleJsonWebTokenError()
    }
    if (name === consts.ERRORS.TOKEN_EXPIRED_ERROR) {
      newError = handleTokenExpiredError()
    }

    sendErrorProd(newError, req, res)
  }
}
