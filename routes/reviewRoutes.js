import { Router } from 'express'
import {
  getAllReviews,
  createReview,
  deleteReviewById,
  updateReviewById,
  setTourAndUserIds,
  getReviewById,
} from './../controllers/reviewController'
import { protect, restrictTo } from './../controllers/authController'
import { consts } from '../constants/consts'

const router = Router({
  mergeParams: true,
})

router
  .route('/')
  .get(getAllReviews)
  .post(
    protect,
    restrictTo(consts.AUTH.ROLES.USER, consts.AUTH.ROLES.ADMIN),
    setTourAndUserIds,
    createReview
  )

router
  .route('/:id')
  .get(getReviewById)
  .delete(
    protect,
    restrictTo(consts.AUTH.ROLES.USER, consts.AUTH.ROLES.ADMIN),
    deleteReviewById
  )
  .patch(
    protect,
    restrictTo(consts.AUTH.ROLES.USER, consts.AUTH.ROLES.ADMIN),
    updateReviewById
  )

export default router
