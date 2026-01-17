const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const controller = require("../controllers/adminWebsiteController");

router.post("/generate/:userId", auth, admin, controller.generateWebsite);
router.patch("/status/:id", auth, admin, controller.updateWebsiteStatus);
router.get("/", auth, controller.getAllWebsites);

module.exports = router;
