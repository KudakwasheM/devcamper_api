const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const geocoder = require("../utils/geocoder");
const Bootcamp = require("../models/Bootcamp");

//Desc      Get all bootcamps
//Route     GET /api/v1/bootcamps
//Access    Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

//Desc      Get single bootcamp
//Route     GET /api/v1/bootcamps/:id
//Access    Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp with id ${req.params.id} not found`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: bootcamp,
    msg: `Display bootcamp ${req.params.id}`,
  });
});

//Desc      Create bootcamp
//Route     POST /api/v1/bootcamps
//Access    Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // Add user
  req.body.user = req.user.id;

  // Check for published bootcamp
  const publishedBootcamps = await Bootcamp.findOne({ user: req.user.id });

  // If user is not an admin,they can only add one bootcamp
  if (publishedBootcamps && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `The user with id ${req.user.id} has already published a bootcamp`
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);

  res
    .status(201)
    .json({ success: true, data: bootcamp, msg: "Create new bootcamp" });
});

//Desc      Update bootcamp
//Route     PUT /api/v1/boo/:id
//Access    Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp with id ${req.params.id} not found`, 404)
    );
  }

  // Make sure user is owner of bootcamp
  if (bootcamp.user.toString !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this bootcamp`,
        404
      )
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: bootcamp,
    msg: `Updated bootcamp ${req.params.id}`,
  });
});

//Desc      Delete bootcamp
//Route     DELETE /api/v1/bootcamps/:id
//Access    Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp with id ${req.params.id} not found`, 404)
    );
  }

  // Make sure user is owner of bootcamp
  if (bootcamp.user.toString !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this bootcamp`,
        404
      )
    );
  }

  await bootcamp.deleteOne({ _id: bootcamp._id });

  res.status(200).json({
    success: true,
    data: {},
    msg: `Deleted bootcamp ${req.params.id}`,
  });
});

//Desc      Get bootcamps  within a radius
//Route     GET /api/v1/bootcamps/radius/:zipcode/:distance
//Access    Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  //Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius usinf radians
  // Divide distance by earth radius
  // Earth radius = 3,963 mi / 6,378.1

  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

//Desc      Upload photo for bootcamp
//Route     PUT /api/v1/bootcamps/:id/photo
//Access    Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp with id ${req.params.id} not found`, 404)
    );
  }

  // Make sure user is owner of bootcamp
  if (bootcamp.user.toString !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this bootcamp`,
        404
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 404));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file || !file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload image file`, 404));
  }

  // Chec file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
      400
    );
  }

  // Create custom file name
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(`Problem with file upload`, 500);
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
