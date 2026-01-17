//userController.js
const User = require("../models/User");
const Payment = require("../models/Payment");

// 👤 PROFILE
exports.getUserProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
};

// 📊 DASHBOARD
exports.getUserDashboard = async (req, res) => {
  try {
    const payments = await Payment.find({
      userId: req.user.id,
      status: "success"
    });

    const totalSpent = payments.reduce(
      (sum, p) => sum + p.amount,
      0
    );

    res.json({
      totalPayments: payments.length,
      totalSpent
    });
  } catch {
    res.status(500).json({ msg: "Dashboard error" });
  }
};

// 💳 PAYMENT HISTORY
exports.getUserPayments = async (req, res) => {
  const payments = await Payment.find({
    userId: req.user.id
  }).sort({ createdAt: -1 });

  res.json(payments);
};

exports.getMyProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
};