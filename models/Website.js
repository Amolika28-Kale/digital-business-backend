const mongoose = require("mongoose");

const websiteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  subdomain: {
    type: String,
    unique: true,
  },
  status: {
    type: String,
    enum: ["pending", "active", "disabled"],
    default: "pending",
  },
  generatedAt: Date,
  activatedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model("Website", websiteSchema);
