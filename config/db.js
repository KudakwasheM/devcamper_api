const mongoose = require("mongoose");

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });

  console.log(
    `MongoDB Connected: ${conn.connection.host}`.rainbow.underline.bold
  );
};

module.exports = connectDB;
