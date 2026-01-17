//adminRoutes.js
const express = require("express");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const {
  getAllUsers,
  getAllPayments,
  getDashboardStats,
  getPendingUsers,
  deletePendingUser,
  manualVerifyPayment,
  resendPaymentLink,
  disableUser,
  enableUser,
  resetUserPassword
} = require("../controllers/adminController");

const router = express.Router();
console.log("✅ Admin routes loaded");

router.get("/dashboard", auth, admin, getDashboardStats);
router.get("/users", auth, admin, getAllUsers);
router.get("/payments", auth, admin, getAllPayments);

/* 🔥 NEW – Pending Users */
router.get("/pending-users", auth, admin, getPendingUsers);
router.delete("/pending-users/:id", auth, admin, deletePendingUser);
router.post("/pending-users/:id/verify", auth, admin, manualVerifyPayment);
router.post("/pending-users/:id/resend-link", auth, admin, resendPaymentLink);

router.patch("/users/:id/disable", auth, admin, disableUser);
router.patch("/users/:id/enable", auth, admin, enableUser);
router.post("/users/:id/reset-password", auth, admin, resetUserPassword);

module.exports = router;
