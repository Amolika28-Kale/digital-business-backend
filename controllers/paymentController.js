const stripe = require("../config/stripe");
const User = require("../models/User");
const Payment = require("../models/Payment");
const bcrypt = require("bcryptjs");

exports.createCheckout = async (req, res) => {
  try {
    const { name, email, mobile } = req.body;

    let user = await User.findOne({ email });
    if (user && user.isPaid)
      return res.status(400).json({ message: "Already enrolled" });

    const password = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 10);

    if (!user) {
      user = await User.create({
        name,
        email,
        mobile,
        password: hashedPassword,
        isPaid: false,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
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
      success_url: `${process.env.FRONTEND_URL}/login`,
      cancel_url: `${process.env.FRONTEND_URL}/register`,
      metadata: { userId: user._id.toString() },
    });

    await Payment.create({
      userId: user._id,
      stripeSessionId: session.id,
      amount: 5500,
      status: "pending",
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: "Payment error" });
  }
};

exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      userId: req.user.id
    }).sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch payments" });
  }
};
