const express = require('express')
const morgan = require('morgan')
const path = require('path')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')

const AppError = require('./utils/appError').default
const globalErrorHandler = require('./controllers/errorController').default

const tourRouter = require('./routes/tourRoutes').default
const userRouter = require('./routes/userRoutes').default
const reviewRouter = require('./routes/reviewRoutes').default
const viewRouter = require('./routes/viewRoutes').default
const bookingRouter = require('./routes/bookingRoutes').default

const { consts } = require('./constants/consts')

const app = express()

app.set('view engine', 'pug')

// Serving static files
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))

// Set Security HTTP headers
app.use(helmet())

// Development logging
if (process.env.NODE_ENV === consts.MODE.DEV) {
  app.use(morgan('dev'))
}

// Limit requests from the same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour.',
})
app.use('/api', limiter)

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '20kb' }))
app.use(cookieParser())
app.use(express.urlencoded({ extended: true, limit: '20kb' }))

// Data sanitization against nosql query injection
app.use(mongoSanitize())

// Data sanitization against xss
app.use(xss())

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: consts.PARAMS.WHITELIST,
  })
)

app.use((req, _res, next) => {
  req.requestTime = new Date().toISOString()
  next()
})

app.use('/api/v1/booking', bookingRouter)
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/', viewRouter)

app.all('*', (req, _res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`))
})

app.use(globalErrorHandler)

module.exports = app
