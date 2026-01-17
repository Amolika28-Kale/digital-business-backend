//adminController.js
const User = require("../models/User");
const Payment = require("../models/Payment");
const PendingUser = require("../models/PendingUser");

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
    const pendingUsers = await PendingUser.countDocuments();
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
  pendingUsers,
  totalPayments,
  totalRevenue,
});

  } catch (error) {
    res.status(500).json({ msg: "Dashboard data error" });
  }
};


/* 📌 GET ALL PENDING USERS */
exports.getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await PendingUser.find().sort({ createdAt: -1 });
    res.json(pendingUsers);
  } catch {
    res.status(500).json({ msg: "Failed to fetch pending users" });
  }
};

/* ❌ DELETE PENDING USER */
exports.deletePendingUser = async (req, res) => {
  try {
    await PendingUser.findByIdAndDelete(req.params.id);
    res.json({ msg: "Pending user deleted" });
  } catch {
    res.status(500).json({ msg: "Delete failed" });
  }
};

/* ✅ MANUAL PAYMENT VERIFY (ADMIN POWER) */
exports.manualVerifyPayment = async (req, res) => {
  try {
    const pendingUser = await PendingUser.findById(req.params.id);
    if (!pendingUser)
      return res.status(404).json({ msg: "Pending user not found" });

    // 🔐 generate password
    const rawPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // create user
    const user = await User.create({
      name: pendingUser.name,
      email: pendingUser.email,
      mobile: pendingUser.mobile,
      password: hashedPassword,
      role: "user",
      isPaid: true,
    });

    // create payment record
    await Payment.create({
      userId: user._id,
      stripeSessionId: pendingUser.stripeSessionId,
      amount: 5500,
      status: "success",
    });

    // send credentials
    await sendEmail(
      user.email,
      "Your Login Credentials (Manual Approval)",
      `Welcome 🎉

Email: ${user.email}
Password: ${rawPassword}

Login:
${process.env.FRONTEND_URL}/login`
    );

    await PendingUser.findByIdAndDelete(req.params.id);

    res.json({ msg: "Payment verified & user activated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Manual verification failed" });
  }
};

/* 🔁 RESEND PAYMENT LINK */
exports.resendPaymentLink = async (req, res) => {
  try {
    const pendingUser = await PendingUser.findById(req.params.id);
    if (!pendingUser)
      return res.status(404).json({ msg: "Pending user not found" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: pendingUser.email,
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: "Digital Business Program" },
            unit_amount: 550000,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/payment-success`,
      cancel_url: `${process.env.FRONTEND_URL}/register`,
    });

    pendingUser.stripeSessionId = session.id;
    await pendingUser.save();

    await sendEmail(
      pendingUser.email,
      "Complete Your Payment",
      `Hi ${pendingUser.name},

Your payment is pending.

Complete payment here:
${session.url}`
    );

    res.json({ msg: "Payment link resent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to resend link" });
  }
};

/* 🚫 DISABLE USER */
exports.disableUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ msg: "User disabled" });
};

/* ✅ ENABLE USER */
exports.enableUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isActive: true });
  res.json({ msg: "User enabled" });
};

/* 🔑 RESET USER PASSWORD */
exports.resetUserPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const newPassword = Math.random().toString(36).slice(-8);
    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    await user.save();

    await sendEmail(
      user.email,
      "Your Password Has Been Reset",
      `Hello ${user.name},

Your password has been reset by admin.

Email: ${user.email}
Password: ${newPassword}

Login:
${process.env.FRONTEND_URL}/login`
    );

    res.json({ msg: "Password reset & email sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Password reset failed" });
  }
};