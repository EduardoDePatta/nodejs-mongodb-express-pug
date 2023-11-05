const dotenv = require('dotenv')
dotenv.config({ path: './.env' })
const mongoose = require('mongoose')

process.on('uncaughtException', (error) => {
  console.log('ERROR: ' + error)
  console.log('Shutting down...')
  process.exit(1)
})

const app = require('./app')
const { consts } = require('./constants/consts')

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
)

mongoose.connect(DB).then(() => {
  console.log('DB connection successful!')
})

const port = process.env.PORT || 3000

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`)
})

process.on(consts.ERRORS.UNHANDLED_REJECTION, (error) => {
  console.log('ERROR: ' + error.name, error.message)
  console.log('Shutting down...')
  server.close(() => {
    process.exit(1)
  })
})
