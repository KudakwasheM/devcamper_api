const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Review = require("../models/reviewModel");
const Bootcamp = require("../models/Bootcamp");

//Desc      Get reviews
//Route     GET /api/v1/reviews
//Route     GET /api/v1/bootcamps/:bootcampId/reviews
//Access    Public
const getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    return res
      .status(200)
      .json({ success: true, count: (await reviews).length, data: reviews });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//Desc      Get a single review
//Route     GET /api/v1/reviews/:id
//Access    Public
const getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

//Desc      Create a review for bootcamp
//Route     POST /api/v1/bootcamp/:bootcampId/reviews
//Access    Private
const addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with the id ${req.params.bootcampId}`, 404)
    );
  }

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review,
  });
});

//Desc      Update a review
//Route     PUT /api/v1/reviews/:id
//Access    Private
const updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id ${req.params.bootcampId}`, 404)
    );
  }

  // Make sure review belongs to user or user is an admin
  if (review.user.toString() !== req.user.id && req.user.id !== "admin") {
    return next(new ErrorResponse(`Not authorized to update`, 404));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: review,
  });
});

//Desc      Delete a review
//Route     DELETE /api/v1/reviews/:id
//Access    Private
const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id ${req.params.bootcampId}`, 404)
    );
  }

  // Make sure review belongs to user or user is an admin
  if (review.user.toString() !== req.user.id && req.user.id !== "admin") {
    return next(new ErrorResponse(`Not authorized to update`, 404));
  }

  await review.deleteOne({ _id: review._id });

  res.status(200).json({
    success: true,
    data: {},
  });
});

module.exports = {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
};
