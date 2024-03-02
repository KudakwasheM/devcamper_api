const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Please add a course tile"],
    },
    description: {
      type: String,
      required: [true, "Please add a course description"],
    },
    weeks: {
      type: String,
      required: [true, "Please add a course title"],
    },
    tuition: {
      type: Number,
      required: [true, "Please add a tuition cost"],
    },
    minimumSkill: {
      type: String,
      required: [true, "Please add a minimum skill"],
      enum: ["beginner", "intermediate", "advanced"],
    },
    scholarshipAvailable: {
      type: Boolean,
      default: false,
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

// Static method to get avgof course tuitions
courseSchema.statics.getAverageCost = async function (bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: "$bootcamp",
        averageCost: { $avg: "$tuition" },
      },
    },
  ]);

  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
    });
  } catch (error) {
    console.error(error);
  }
};

// Call getAverageCost after save
courseSchema.post("save", function (next) {
  this.constructor.getAverageCost(this.bootcamp);
});

// Delete courses
courseSchema.pre("remove", function (next) {
  this.constructor.getAverageCost(this.bootcamp);
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
