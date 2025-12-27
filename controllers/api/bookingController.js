const Booking = require("../../database/models/booking");
const Hotel = require("../../database/models/hotel");

// @desc   Create booking
// @route  POST /api/bookings
exports.createBooking = async (req, res, next) => {
  try {
    const {
      hotelId,
      roomType,
      checkInDate,
      checkOutDate,
      numberOfRooms,
      guestName,
      guestEmail,
      guestPhone,
    } = req.body;
    const userId = req.userId;

    if (
      !hotelId ||
      !roomType ||
      !checkInDate ||
      !checkOutDate ||
      !numberOfRooms ||
      !guestName ||
      !guestEmail ||
      !guestPhone
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide all required fields",
      });
    }

    // Get hotel to fetch room price
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({
        status: "fail",
        message: "Hotel not found",
      });
    }

    // Find room type
    const room = hotel.rooms.find((r) => r.type === roomType);
    if (!room) {
      return res.status(404).json({
        status: "fail",
        message: "Room type not available",
      });
    }

    // Check availability
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    const bookedRooms = await Booking.countDocuments({
      hotelId,
      roomType,
      status: "Booked",
      $or: [
        {
          checkInDate: { $lt: checkOut },
          checkOutDate: { $gt: checkIn },
        },
      ],
    });

    const availableRooms = room.totalRooms - bookedRooms;

    if (availableRooms < numberOfRooms) {
      return res.status(400).json({
        status: "fail",
        message: `Only ${availableRooms} rooms available for the selected dates`,
      });
    }

    // Calculate total price
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalPrice = room.price * numberOfRooms * days;

    // Create booking
    const booking = await Booking.create({
      userId,
      hotelId,
      roomType,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfRooms,
      totalPrice,
      guestName,
      guestEmail,
      guestPhone,
    });

    // Populate references
    await booking.populate(["userId", "hotelId"]);

    res.status(201).json({
      status: "success",
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// @desc   Get user bookings
// @route  GET /api/bookings/my
exports.getUserBookings = async (req, res, next) => {
  try {
    const userId = req.userId;

    const bookings = await Booking.find({ userId })
      .populate("hotelId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// @desc   Get single booking
// @route  GET /api/bookings/:id
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("userId")
      .populate("hotelId");

    if (!booking) {
      return res.status(404).json({
        status: "fail",
        message: "Booking not found",
      });
    }

    // Check if user owns this booking
    if (booking.userId._id.toString() !== req.userId) {
      return res.status(403).json({
        status: "fail",
        message: "Not authorized to view this booking",
      });
    }

    res.status(200).json({
      status: "success",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// @desc   Cancel booking
// @route  PUT /api/bookings/:id/cancel
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        status: "fail",
        message: "Booking not found",
      });
    }

    // Check if user owns this booking
    if (booking.userId.toString() !== req.userId) {
      return res.status(403).json({
        status: "fail",
        message: "Not authorized to cancel this booking",
      });
    }

    // Check if booking is already cancelled
    if (booking.status === "Cancelled") {
      return res.status(400).json({
        status: "fail",
        message: "Booking is already cancelled",
      });
    }

    // Update status
    booking.status = "Cancelled";
    await booking.save();

    res.status(200).json({
      status: "success",
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
