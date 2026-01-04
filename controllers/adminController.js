const User = require("../models/User");
const Payment = require("../models/Payment");

exports.getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

exports.getAllPayments = async (req, res) => {
  const payments = await Payment.find().populate("userId", "name email");
  res.json(payments);
};


exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const paidUsers = await User.countDocuments({ isPaid: true });

    const totalPayments = await Payment.countDocuments({
      status: "success"
    });

    const revenueResult = await Payment.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    res.json({
      totalUsers,
      paidUsers,
      totalPayments,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ msg: "Dashboard data error" });
  }
};