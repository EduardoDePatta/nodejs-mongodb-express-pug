import { Router } from 'express'
import { protect, restrictTo } from './../controllers/authController'
import {
  createBooking,
  deleteBookingById,
  getAllBookings,
  getBookingById,
  getCheckoutSession,
  updateBookingById,
} from '../controllers/bookingController'
import { consts } from '../constants/consts'

const router = Router()

router.use(protect)
router.get('/checkout-session/:tourId', getCheckoutSession)

router.use(restrictTo(consts.AUTH.ROLES.ADMIN, consts.AUTH.ROLES.LEAD_GUIDE))
router.route('/').get(getAllBookings).post(createBooking)
router
  .route('/:id')
  .get(getBookingById)
  .patch(updateBookingById)
  .delete(deleteBookingById)

export default router
