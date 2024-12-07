const mongoose = require('mongoose');

const ReviewSchema = mongoose.Schema(
  {
    // Overall rating (average of all factors)
    rating: {
      type: Number,
      min: 0,
      max: 5,
      required: [true, 'Please provide overall rating'],
    },
    // Individual rating factors
    efficiency: {
      type: Number,
      min: 0,
      max: 5,
      required: [true, 'Please provide efficiency rating'],
    },
    communication: {
      type: Number,
      min: 0,
      max: 5,
      required: [true, 'Please provide communication rating'],
    },
    qualityOfWork: {
      type: Number,
      min: 0,
      max: 5,
      required: [true, 'Please provide quality of work rating'],
    },
    timeliness: {
      type: Number,
      min: 0,
      max: 5,
      required: [true, 'Please provide timeliness rating'],
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

// Static method to calculate average rating and factors
ReviewSchema.statics.calculateAverageRatings = async function (freelancerId) {
  const result = await this.aggregate([
    { $match: { freelancer: freelancerId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        averageEfficiency: { $avg: '$efficiency' },
        averageCommunication: { $avg: '$communication' },
        averageQualityOfWork: { $avg: '$qualityOfWork' },
        averageTimeliness: { $avg: '$timeliness' },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    await this.model('Freelancer').findOneAndUpdate(
      { _id: freelancerId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        averageEfficiency: Math.ceil(result[0]?.averageEfficiency || 0),
        averageCommunication: Math.ceil(result[0]?.averageCommunication || 0),
        averageQualityOfWork: Math.ceil(result[0]?.averageQualityOfWork || 0),
        averageTimeliness: Math.ceil(result[0]?.averageTimeliness || 0),
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

// Middleware to recalculate ratings after save and remove
ReviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRatings(this.freelancer);
});

ReviewSchema.post('remove', async function () {
  await this.constructor.calculateAverageRatings(this.freelancer);
});

module.exports = mongoose.model('Review', ReviewSchema);
