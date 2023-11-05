import { Router } from 'express'
import {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  updateSettings,
  getMyTours,
} from '../controllers/viewController'
import { isLoggedIn, protect } from '../controllers/authController'
import { createBookingCheckout } from '../controllers/bookingController'

const router = Router()

router.get('/', createBookingCheckout, isLoggedIn, getOverview)
router.get('/tour/:slug', isLoggedIn, getTour)
router.get('/login', isLoggedIn, getLoginForm)
router.get('/me', protect, getAccount)
router.get('/my-tours', protect, getMyTours)
router.post('/submit-user-data', protect, updateSettings)

export default router
