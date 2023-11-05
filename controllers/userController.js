import multer from 'multer'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'
import User from './../models/userModel'
import { deleteOne, updateOne, getOne, getAll } from './handlerFactory'
import sharp from 'sharp'

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image')) {
    callback(null, true)
  } else {
    callback(
      new AppError('Not an image! Please upload only images.', 400),
      false
    )
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
})
export const uploadUserPhoto = upload.single('photo')

export const resizeUserPhoto = catchAsync(async (req, res, next) => {
  const { file } = req
  const { id } = req.user

  if (!file) return next()

  req.file.filename = `user-${id}-${Date.now()}.jpeg`
  const { filename } = req.file

  await sharp(file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${filename}`)

  next()
})

const filterObj = (obj, ...allowedFields) => {
  const newObject = {}
  Object.keys(obj).forEach((element) => {
    if (allowedFields.includes(element)) {
      newObject[element] = obj[element]
    }
  })
  return newObject
}

export const updateMe = catchAsync(async (req, res, next) => {
  const { id } = req.user

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use updatePassword',
        400
      )
    )
  }

  const filteredBody = filterObj(req.body, 'name', 'email')

  if (req.file) {
    filteredBody.photo = req.file.filename
  }

  const updatedUser = await User.findByIdAndUpdate(id, filteredBody, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  })
})

export const deleteMe = catchAsync(async (req, res, next) => {
  const { id } = req.user
  await User.findByIdAndUpdate(id, { active: false })
  res.status(204).json({
    status: 'success',
    data: null,
  })
})

export function getMe(req, res, next) {
  req.params.id = req.user.id
  next()
}

export function createUser(req, res) {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined! Please use signup instead.',
  })
}

export const getAllUsers = getAll(User)
export const getUserById = getOne(User)
export const updateUserById = updateOne(User)
export const deleteUserById = deleteOne(User)
