const Review = require('../models/review');
const Freelancer = require('../models/freelancer');
const Client = require('../models/client')
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');

const createReview = async (req, res) => {
    console.log('req.user:', req.user);
    const { freelancer: freelancerId } = req.body;
  
    // Check if the freelancer exists
    const isValidFreelancer = await Freelancer.findOne({ _id: freelancerId });
    if (!isValidFreelancer) {
      throw new CustomError.NotFoundError(`No freelancer with id: ${freelancerId}`);
    }
  
    // Check if the client (req.user) has already submitted a review for this freelancer
    const alreadySubmitted = await Review.findOne({
      freelancer: freelancerId,
      user: req.user.userId, // Make sure `req.user.clientId` is being set by your authentication middleware
    });
  
    if (alreadySubmitted) {
      throw new CustomError.BadRequestError('You have already submitted a review for this freelancer.');
    }
  
    // Assign clientId to the review body (making sure to store the authenticated client)
    req.body.user = req.user.userId;
  
    // Create the review in the database
    const review = await Review.create(req.body);    
    // Respond with the created review
    res.status(StatusCodes.CREATED).json({ review });
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
