const mongoose = require('mongoose');
const CustomError = require('../errors')
const ReviewSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 0,
      max: 5,
      required: [true, 'Please provide rating'],
    },
    title: {
      type: String,
      trim: true,
      required: [true, 'Please provide review title'],
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, 'Please provide review text'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'Client',
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.ObjectId,
      ref: 'Freelancer',
      required: true,
    },
  },
  { timestamps: true }
);

// Index to prevent duplicate reviews by the same user
ReviewSchema.index({ freelancer: 1, user: 1 }, { unique: true });

// Static method to calculate average rating
ReviewSchema.statics.calculateAverageRating = async function (freelancerId) {
  const result = await this.aggregate([
    { $match: { freelancer: freelancerId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);

  try {
   
    await this.model('Freelancer').findOneAndUpdate(
      { _id: freelancerId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

// Middleware to recalculate rating on save and remove
ReviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.freelancer);
});

ReviewSchema.post('remove', async function () {
  await this.constructor.calculateAverageRating(this.freelancer);
});

module.exports = mongoose.model('Review', ReviewSchema);