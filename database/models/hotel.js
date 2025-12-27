const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide hotel name"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Please provide hotel location"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    rooms: [
      {
        type: {
          type: String,
          required: true,
          enum: ["Single", "Double", "Suite", "Deluxe"],
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        totalRooms: {
          type: Number,
          required: true,
          min: 1,
        },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hotel", hotelSchema);
