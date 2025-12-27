const express = require("express");
const bookingController = require("../controllers/api/bookingController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Specific routes before :id parameter route
router.get("/my", protect, bookingController.getUserBookings);

// Parameterized routes
router.post("/", protect, bookingController.createBooking);
router.get("/:id", protect, bookingController.getBooking);
router.put("/:id/cancel", protect, bookingController.cancelBooking);

module.exports = router;
