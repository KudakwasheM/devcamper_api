const express = require("express");
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} = require("../controllers/bootcampsController");

const Bootcamp = require("../models/Bootcamp");
const advancedResults = require("../middleware/advancedResults");

// Include other resource router
const courseRouter = require("./coursesRoutes");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

// Re-route into other resource router
router.use("/:bootcampId/courses", courseRouter);

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);
router
  .route("/:id/photo")
  .put(protect, authorize("publisher", "admin"), bootcampPhotoUpload);
router
  .route("/")
  .get(advancedResults(Bootcamp), getBootcamps)
  .post(protect, createBootcamp);
router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, authorize("publisher", "admin"), updateBootcamp)
  .delete(protect, authorize("publisher", "admin"), deleteBootcamp);

module.exports = router;
