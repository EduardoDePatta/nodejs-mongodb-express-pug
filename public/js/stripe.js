import axios from 'axios'
import { showAlert } from './alerts'
import Stripe from 'stripe'
import AppError from '../../utils/appError'

const stripe = Stripe(process.env.STRIPE_PUBLIC_KEY)

export const bookTour = async (tourId) => {
  try {
    const session = await axios(
      `http://localhost:3000/api/v1/booking/checkout-session/${tourId}`
    )

    if (session) {
      window.location.href = session.data.session.url
    } else {
      showAlert('error', 'Unknown error')
    }
  } catch (error) {
    showAlert('error', error)
  }
}
