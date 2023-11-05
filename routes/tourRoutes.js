import { Router } from 'express'
import {
  createTour,
  deleteTourById,
  getAllTours,
  getTourById,
  updateTourById,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  resizeTourImages,
  uploadTourImages,
} from '../controllers/tourController'
import { protect, restrictTo } from '../controllers/authController'
import reviewRouter from './reviewRoutes'
import { consts } from '../constants/consts'

const router = Router()

router.use('/:tourId/reviews', reviewRouter)
router
  .route('/')
  .get(getAllTours)
  .post(
    protect,
    restrictTo(consts.AUTH.ROLES.ADMIN, consts.AUTH.ROLES.LEAD_GUIDE),
    createTour
  )
router.route('/distances/:latlng/unit/:unit').get(getDistances)
router.route('/top-5-cheap').get(aliasTopTours, getAllTours)
router.route('/tour-stats').get(getTourStats)
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin)
router
  .route('/monthly-plan/:year')
  .get(
    protect,
    restrictTo(
      consts.AUTH.ROLES.ADMIN,
      consts.AUTH.ROLES.LEAD_GUIDE,
      consts.AUTH.ROLES.GUIDE
    ),
    getMonthlyPlan
  )
router
  .route('/:id')
  .get(getTourById)
  .patch(
    protect,
    restrictTo(consts.AUTH.ROLES.ADMIN, consts.AUTH.ROLES.LEAD_GUIDE),
    uploadTourImages,
    resizeTourImages,
    updateTourById
  )
  .delete(
    protect,
    restrictTo(consts.AUTH.ROLES.ADMIN, consts.AUTH.ROLES.LEAD_GUIDE),
    deleteTourById
  )

export default router
