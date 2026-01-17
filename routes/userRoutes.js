//userRoutes.js
const express = require("express");
const auth = require("../middleware/authMiddleware");

const {
  getUserProfile,
  getUserDashboard,
  getUserPayments,
  getMyProfile
} = require("../controllers/userController");

const router = express.Router();

// User dashboard stats
router.get("/dashboard", auth, getUserDashboard);

// User profile
router.get("/profile", auth, getUserProfile);

// User payments history
router.get("/payments", auth, getUserPayments);

router.get("/me", auth, getMyProfile);

module.exports = router;
