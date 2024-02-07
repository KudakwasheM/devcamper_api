const express = require("express");
const dotenv = require("dotenv");

//Load env vars
//Path is there because env file is in a special locationa
dotenv.config({ path: "./config/config.env" });

const app = express();

// app.get("/", (req, res) => {
//     // res.send("Hello from express");
//     // res.send({ name: "Kudakwashe" });
//     // res.json({ name: "Kudakwashe" });
//     // res.sendStatus(400);
//     // res.status(400).json({ success: false });
//   res.status(200).json({ success: true, data: { id: 1 } });
// });

app.get("/api/v1/bootcamps", (req, res) => {
  res.status(200).json({ success: true, msg: "Show all bootcamps" });
});

app.post("/api/v1/bootcamps", (req, res) => {
  res.status(201).json({ success: true, msg: "Create new bootcamp" });
});

app.get("/api/v1/bootcamps/:id", (req, res) => {
  res
    .status(200)
    .json({ success: true, msg: `Display bootcamp ${req.params.id}` });
});

app.put("/api/v1/bootcamps/:id", (req, res) => {
  res
    .status(200)
    .json({ success: true, msg: `Update bootcamp ${req.params.id}` });
});

app.delete("/api/v1/bootcamps/:id", (req, res) => {
  res
    .status(200)
    .json({ success: true, msg: `Delete bootcamp ${req.params.id}` });
});

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
