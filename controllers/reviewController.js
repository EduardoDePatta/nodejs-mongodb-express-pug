import Review from './../models/reviewModel'
import {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} from './handlerFactory'

export function setTourAndUserIds(req, res, next) {
  if (!req.body.tour) req.body.tour = req.params.tourId
  if (!req.body.user) req.body.user = req.user.id
  next()
}

export const getAllReviews = getAll(Review)
export const createReview = createOne(Review)
export const deleteReviewById = deleteOne(Review)
export const updateReviewById = updateOne(Review)
export const getReviewById = getOne(Review)
