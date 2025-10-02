const express = require("express");
const router = express.Router();
const { getReviews, addReview, deleteReview } = require("../controllers/performanceReview.controller");
const { auth, adminOnly } = require("../middleware/auth");

router.get("/", auth, getReviews);
router.post("/", auth, adminOnly, addReview);
router.delete("/:ReviewID", auth, adminOnly, deleteReview);

module.exports = router;