const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  stripeSessionId: String,
  amount: Number,
  status: String,
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
