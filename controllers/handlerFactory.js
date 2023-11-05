import APIFeatures from '../utils/apiFeatures'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'

export function deleteOne(Model) {
  return catchAsync(async (req, res, next) => {
    const { id } = req.params
    const doc = await Model.findByIdAndDelete(id)

    if (!doc) {
      return next(new AppError('No document found with that ID', 404))
    }

    res.status(204).json({
      status: 'sucess',
      data: null,
    })
  })
}

export function updateOne(Model) {
  return catchAsync(async (req, res, next) => {
    const { id } = req.params
    const doc = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!doc) {
      return next(new AppError('No document found with that ID', 404))
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    })
  })
}

export function createOne(Model) {
  return catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body)
    res.status(201).json({
      status: 'success',
      data: {
        data: newDoc,
      },
    })
  })
}

export function getOne(Model, populateOptions) {
  return catchAsync(async (req, res, next) => {
    const { id } = req.params

    let query = Model.findById(id)
    if (populateOptions) query = query.populate(populateOptions)

    const doc = await query

    if (!doc) {
      return next(new AppError('No documents found with that ID', 404))
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    })
  })
}

export function getAll(Model) {
  return catchAsync(async (req, res, next) => {
    // TODO: RM this tours specific
    const { tourId } = req.params
    let filter = {}
    if (tourId) filter = { tour: tourId }
    // --

    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()

    const doc = await features.query

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    })
  })
}
