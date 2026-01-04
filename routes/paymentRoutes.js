const express = require("express");
const stripe = require("../config/stripe");
const PendingUser = require("../models/PendingUser");
const { getMyPayments } = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/create-checkout", async (req, res) => {
  const { name, email, mobile } = req.body;

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
    success_url: `${process.env.FRONTEND_URL}/payment-success`,
    cancel_url: `${process.env.FRONTEND_URL}/register`,
  });

  await PendingUser.create({
    name,
    email,
    mobile,
    stripeSessionId: session.id,
  });

  res.json({ url: session.url });
});

// USER PAYMENTS
router.get("/my", authMiddleware, getMyPayments);
module.exports = router;
