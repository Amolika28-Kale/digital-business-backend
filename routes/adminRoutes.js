const express = require("express");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const {
  getAllUsers,
  getAllPayments,
  getDashboardStats
} = require("../controllers/adminController");

const router = express.Router();
console.log("✅ Admin routes loaded");

router.get("/dashboard", auth, admin, getDashboardStats);
router.get("/users", auth, admin, getAllUsers);
router.get("/payments", auth, admin, getAllPayments);

module.exports = router;
