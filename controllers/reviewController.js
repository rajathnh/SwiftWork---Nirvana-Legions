const Review = require('../models/review');
const Freelancer = require('../models/freelancer');
const Client = require('../models/client')
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');
const Gig = require('../models/Gig')

const createReview = async (req, res) => {
  const { gigId, rating, efficiency, communication, qualityOfWork, timeliness, title, comment } = req.body;
  console.log("♨️REVIEW CAME!!♨️");

  // Validate gig and freelancer existence (same as before)
  const gig = await Gig.findById(gigId);
  if (!gig) {
    throw new CustomError.NotFoundError('Gig not found');
  }

  // if (gig.client.toString() !== req.user.userId) {
  //   throw new CustomError.UnauthorizedError('You are not authorized to review this gig');
  // }

  if (gig.status !== 'approval pending') {
    throw new CustomError.BadRequestError('Review can only be submitted for gigs in approval pending status');
  }

  const freelancer = await Freelancer.findById(gig.assignedFreelancer);
  if (!freelancer) {
    throw new CustomError.NotFoundError('Freelancer not found');
  }

  // Create the review
  const review = await Review.create({
    rating,
    efficiency,
    communication,
    qualityOfWork,
    timeliness,
    title,
    comment,
    // user: req.user.userId,
    freelancer: gig.assignedFreelancer,
  });

  // Mark the gig as completed
  gig.status = 'completed';
  await gig.save();
  console.log("♨️✨✨✨✨♨️ review accepte", );
  res.status(StatusCodes.CREATED).json({
    message: 'Review submitted and gig marked as completed',
    review,
  });
};


const getAllReviews = async (req, res) => {
  const reviews = await Review.find({}).populate({path:'freelancer',select:'name'})

  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomError.NotFoundError(`No review with id: ${reviewId}`);
  }

  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const { rating, title, comment } = req.body;

  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomError.NotFoundError(`No review with id: ${reviewId}`);
  }
  console.log(review.user)
  checkPermissions(req.user, review.user); // Ensure the user owns the review

  review.rating = rating;
  review.title = title;
  review.comment = comment;

  await review.save();
  res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomError.NotFoundError(`No review with id: ${reviewId}`);
  }
  console.log(review.client)
  checkPermissions(req.user, review.user); // Ensure the user owns the review
  await review.deleteOne();

  res.status(StatusCodes.OK).json({ msg: 'Success! Review removed.' });
};

const getSingleFreelancerReview = async (req, res) => {
  const { id: freelancerId } = req.params;
  const reviews = await Review.find({ freelancer: freelancerId });

  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleFreelancerReview,
};
