const express = require("express");
const hotelController = require("../controllers/api/hotelController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", hotelController.getAllHotels);
router.post("/check-availability", hotelController.checkAvailability);
router.post("/create", hotelController.createHotel);
router.get("/:id", hotelController.getHotel);

module.exports = router;
