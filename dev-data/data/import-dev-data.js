const fs = require('fs')
const dotenv = require('dotenv')
dotenv.config({ path: './.env' })
const mongoose = require('mongoose')
const Tour = require('../../models/tourModel').default
const User = require('../../models/userModel').default
const Review = require('../../models/reviewModel').default

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
)

mongoose.connect(DB).then(() => {
  console.log('DB connection successful!')
})

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'))
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
)

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    // await Tour.create(tours)
    // await User.create(users, { validateBeforeSave: false })
    await Review.create(reviews)
    console.log('Data successfully loaded!')
    process.exit()
  } catch (error) {
    console.log(error.message)
  }
}

// DELETE ALL DATA FROM COLLECTION
const deleteData = async () => {
  try {
    // await Tour.deleteMany()
    await User.deleteMany()
    await Review.deleteMany()
    console.log('Data successfully deleted!')
    process.exit()
  } catch (error) {
    console.log(error.message)
  }
}

if (process.argv[2] === '--import') {
  importData()
} else if (process.argv[2] === '--delete') {
  deleteData()
} else {
  console.log('Invalid command.')
}
