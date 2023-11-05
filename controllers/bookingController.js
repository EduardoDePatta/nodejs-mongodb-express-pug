import catchAsync from '../utils/catchAsync'
import Tour from '../models/tourModel'
import stripe from 'stripe'
import Booking from '../models/bookingModel'
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from './handlerFactory'

const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY)

export const getCheckoutSession = catchAsync(async (req, res, next) => {
  const { tourId } = req.params
  const { email } = req.user

  const tour = await Tour.findById(tourId)

  const session = await stripeInstance.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: email,
    client_reference_id: tourId,
  })

  res.status(200).json({
    status: 'success',
    session,
  })
})

export const createBookingCheckout = catchAsync(async (req, res, next) => {
  // temporary, everyone can make bookings without paying
  const { tour, user, price } = req.query

  if (!tour && !user && !price) return next()

  await Booking.create({ tour, user, price })

  res.redirect(req.originalUrl.split('?')[0])
})

export const createBooking = createOne(Booking)
export const getBookingById = getOne(Booking)
export const getAllBookings = getAll(Booking)
export const updateBookingById = updateOne(Booking)
export const deleteBookingById = deleteOne(Booking)
