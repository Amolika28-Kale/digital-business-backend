const Website = require("../models/Website");
const User = require("../models/User");

exports.generateWebsite = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isPaid) {
      return res.status(400).json({ message: "User has not completed payment" });
    }

    if (user.websiteGenerated) {
      return res.status(400).json({ message: "Website already generated" });
    }

    const subdomain = user.name.toLowerCase().replace(/\s+/g, "");

    const website = await Website.create({
      userId,
      subdomain,
      status: "pending",
      generatedAt: new Date(),
    });

    // 🔥 IMPORTANT
    user.websiteGenerated = true;
    await user.save();

    res.json({ message: "Website generated", website });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateWebsiteStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const website = await Website.findById(id);
  if (!website) return res.status(404).json({ message: "Website not found" });

  website.status = status;
  if (status === "active") website.activatedAt = new Date();

  await website.save();
  res.json({ message: "Website status updated" });
};

exports.getAllWebsites = async (req, res) => {
  const websites = await Website.find()
    .populate("userId", "name email");
  res.json(websites);
};
