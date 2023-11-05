import { Schema, model } from 'mongoose'

const options = {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
}

const bookingSchema = new Schema(
  {
    tour: {
      type: Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Booking must belong to a Tour!'],
    },
    user: {
      type: Schema.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a User!'],
    },
    price: {
      type: Number,
      required: [true, 'Booking must have a Price!'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    paid: {
      type: Boolean,
      default: true,
    },
  },
  options
)

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({ path: 'tour', select: 'name' })
  next()
})

const Booking = model('Booking', bookingSchema)
export default Booking
