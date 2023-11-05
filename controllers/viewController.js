import Booking from '../models/bookingModel'
import Tour from '../models/tourModel'
import User from '../models/userModel'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'

export const getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find()
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  })
})

export const getTour = catchAsync(async (req, res, next) => {
  const { slug } = req.params
  const tour = await Tour.findOne({ slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  })
  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404))
  }
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  })
})

export const getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  })
}

export const getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  })
}

export const getMyTours = catchAsync(async (req, res, next) => {
  const { id } = req.user

  const bookings = await Booking.find({ user: id })
  const tourIds = bookings.map((el) => el.tour)
  const tours = await Tour.find({ _id: { $in: tourIds } })

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  })
})

export const updateSettings = catchAsync(async (req, res, next) => {
  const { id } = req.user
  const { name, email } = req.body

  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      name,
      email,
    },
    {
      new: true,
      runValidators: true,
    }
  )

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  })
})
