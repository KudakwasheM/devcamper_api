const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Please add a tile"],
      maxlength: 100,
    },
    text: {
      type: String,
      required: [true, "Please add some text"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
      required: [true, "Please add a rating between 1 and 10"],
    },
    bootcamp: {
      type: mongoose.Schema.ObjectId,
      ref: "Bootcamp",
      required: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent user from submitting more than one review per bootcamp
reviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

// Static method to get avg rating
reviewSchema.statics.getAverageRating = async function (bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: "$bootcamp",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageRating: obj[0].averageRating,
    });
  } catch (error) {
    console.error(error);
  }
};

// Call getAverageRating after save
reviewSchema.post("save", function (next) {
  this.constructor.getAverageRating(this.bootcamp);
});

// Delete review
reviewSchema.pre("remove", function (next) {
  this.constructor.getAverageRating(this.bootcamp);
});

const Review = mongoose.model("review", reviewSchema);

module.exports = Review;
