// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

/**
 * 🔥 STRIPE WEBHOOK — MUST BE FIRST
 */
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  require("./routes/stripeWebhook")
);

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/user", require("./routes/userRoutes"));

// app.get("/test-email", async (req, res) => {
//   const sendEmail = require("./utils/sendEmail");

//   await sendEmail(
//     "kaleamolika28@gmail.com",
//     "Brevo API Works 🎉",
//     "If you got this email, Brevo API is working perfectly."
//   );

//   res.send("Email sent");
// });


app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
