const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/error");
const connectDB = require("./config/db");
//Load env vars
//Path is there because env file is in a special locationa
dotenv.config({ path: "./config/config.env" });

//Connect to Database
connectDB();

// Route files
const authRoutes = require("./routes/authRoutes");
const bootcampsRoutes = require("./routes/bootcampsRoutes");
const coursesRoutes = require("./routes/coursesRoutes");
const usersRoutes = require("./routes/usersRoutes");
const reviewsRoutes = require("./routes/reviewsRoutes");

const app = express();

//Body Parser
app.use(express.json());

// Cookie Parser
app.use(cookieParser());

//Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// File upload
app.use(fileupload());

// Static folder
app.use(express.static(path.join(__dirname, "public")));

//Mount routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/bootcamps", bootcampsRoutes);
app.use("/api/v1/courses", coursesRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/reviews", reviewsRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.white.bold
      .underline
  )
);

//Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  //Close server & exit process
  server.close(() => process.exit(1));
});
