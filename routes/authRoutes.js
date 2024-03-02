const express = require("express");
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.route("/me").get(protect, getMe);

module.exports = router;
