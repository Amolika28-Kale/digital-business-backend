const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const PendingUser = require("../models/PendingUser");
const User = require("../models/User");
const Payment = require("../models/Payment");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcryptjs");

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
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ VERY IMPORTANT
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const pendingUser = await PendingUser.findOne({
      stripeSessionId: session.id,
    });

    if (!pendingUser) return res.json({ received: true });

    // 🔐 generate password
    const rawPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // ✅ Create user
    const user = await User.create({
      name: pendingUser.name,
      email: pendingUser.email,
      mobile: pendingUser.mobile,
      password: hashedPassword,
      role: "user",
      isPaid: true,
    });

    // ✅ Save payment
    await Payment.create({
      userId: user._id,
      stripeSessionId: session.id,
      amount: session.amount_total / 100,
      status: "success",
    });

    // ❌ THIS WAS MISSING BEFORE
    await sendEmail(
      user.email,
      "Your Login Credentials",
      `
      Welcome 🎉

      Email: ${user.email}
      Password: ${rawPassword}

      Login here:
      ${process.env.FRONTEND_URL}/login
      `
    );

    // cleanup
    await PendingUser.deleteOne({ _id: pendingUser._id });
  }

  res.json({ received: true });
};
