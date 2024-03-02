const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");

//Desc      Get courses
//Route     GET /api/v1/courses
//Route     GET /api/v1/bootcamps/:bootcampId/courses
//Access    Public
const getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = Course.find({ bootcamp: req.params.bootcampId });
    return res
      .status(200)
      .json({ success: true, count: (await courses).length, data: courses });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//Desc      Get a single course
//Route     GET /api/v1/courses/:id
//Access    Public
const getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!course) {
    return next(
      new ErrorResponse(`No course with the id ${req.params.id}`),
      404
    );
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

//Desc      Add a single course
//Route     POST /api/v1/bootcamps/:bootcampId/courses
//Access    Private
const addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with the id ${req.params.id}`),
      404
    );
  }

  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,
    data: course,
  });
});

//Desc      Update a single course
//Route     PUT /api/v1/courses/:id
//Access    Private
const updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No bootcamp with the id ${req.params.id}`),
      404
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: course,
  });
});

//Desc      Delete a single course
//Route     DELETE /api/v1/courses/:id
//Access    Private
const deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No bootcamp with the id ${req.params.id}`),
      404
    );
  }

  await Course.deleteOne({ _id: course._id });
  // course.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

module.exports = {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
};
