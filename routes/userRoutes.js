import { Router } from 'express'
import {
  signup,
  login,
  resetPassword,
  forgotPassword,
  protect,
  updatePassword,
  restrictTo,
  logout,
} from '../controllers/authController'
import {
  createUser,
  deleteUserById,
  getAllUsers,
  getUserById,
  updateUserById,
  updateMe,
  deleteMe,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
} from '../controllers/userController'
import { consts } from '../constants/consts'

const router = Router()

router.post('/signup', signup)
router.post('/login', login)
router.get('/logout', logout)
router.post('/forgotPassword', forgotPassword)
router.patch('/resetPassword/:token', resetPassword)
router.patch('/updateMyPassword', protect, updatePassword)
router.patch('/updateMe', protect, uploadUserPhoto, resizeUserPhoto, updateMe)
router.delete('/deleteMe', protect, deleteMe)
router.get('/me', protect, getMe, getUserById)

router
  .route('/')
  .get(
    protect,
    restrictTo(consts.AUTH.ROLES.ADMIN, consts.AUTH.ROLES.LEAD_GUIDE),
    getAllUsers
  )
  .post(createUser)

router
  .route('/:id')
  .get(getUserById)
  .patch(protect, restrictTo(consts.AUTH.ROLES.ADMIN), updateUserById)
  .delete(protect, restrictTo(consts.AUTH.ROLES.ADMIN), deleteUserById)
export default router
