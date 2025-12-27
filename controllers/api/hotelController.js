const Hotel = require("../../database/models/hotel");
const Booking = require("../../database/models/booking");

// @desc   Get all hotels
// @route  GET /api/hotels
exports.getAllHotels = async (req, res, next) => {
  try {
    const hotels = await Hotel.find();

    res.status(200).json({
      status: "success",
      count: hotels.length,
      data: hotels,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// @desc   Get single hotel
// @route  GET /api/hotels/:id
exports.getHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        status: "fail",
        message: "Hotel not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: hotel,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// @desc   Create hotel (Admin)
// @route  POST /api/hotels
exports.createHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.create(req.body);

    res.status(201).json({
      status: "success",
      data: hotel,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// @desc   Check room availability
// @route  POST /api/hotels/check-availability
exports.checkAvailability = async (req, res, next) => {
  try {
    const { hotelId, roomType, checkInDate, checkOutDate, numberOfRooms } =
      req.body;

    if (
      !hotelId ||
      !roomType ||
      !checkInDate ||
      !checkOutDate ||
      !numberOfRooms
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide all required fields",
      });
    }

    // Get hotel
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({
        status: "fail",
        message: "Hotel not found",
      });
    }

    // Find room type in hotel
    const room = hotel.rooms.find((r) => r.type === roomType);
    if (!room) {
      return res.status(404).json({
        status: "fail",
        message: "Room type not available",
      });
    }

    // Count booked rooms for the date range
    const bookedRooms = await Booking.countDocuments({
      hotelId,
      roomType,
      status: "Booked",
      $or: [
        {
          checkInDate: { $lt: new Date(checkOutDate) },
          checkOutDate: { $gt: new Date(checkInDate) },
        },
      ],
    });

    const availableRooms = room.totalRooms - bookedRooms;

    res.status(200).json({
      status: "success",
      available: availableRooms >= numberOfRooms,
      availableRooms,
      requiredRooms: numberOfRooms,
      price: room.price,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
