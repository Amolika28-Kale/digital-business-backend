// routes/stripeWebhook.js
const stripe = require("../config/stripe");
const PendingUser = require("../models/PendingUser");
const User = require("../models/User");
const Payment = require("../models/Payment");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");

module.exports = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log("❌ Webhook signature failed:", err.message);
    return res.status(400).send("Webhook Error");
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const pending = await PendingUser.findOne({
      stripeSessionId: session.id,
    });

    if (!pending) return res.json({ received: true });

    const rawPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const user = await User.create({
      name: pending.name,
      email: pending.email,
      mobile: pending.mobile,
      password: hashedPassword,
      isPaid: true,
    });

    await Payment.create({
      userId: user._id,
      stripeSessionId: session.id,
      amount: session.amount_total / 100,
      status: "success",
    });

    await sendEmail(
      user.email,
      "Your Login Credentials",
      `Welcome 🎉

Login: ${process.env.FRONTEND_URL}/login
Email: ${user.email}
Password: ${rawPassword}`
    );

    await PendingUser.deleteOne({ _id: pending._id });
  }

  res.json({ received: true });
};
