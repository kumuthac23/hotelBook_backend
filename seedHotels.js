const mongoose = require("mongoose");
require("dotenv").config();

const Hotel = require("./database/models/hotel");

const connectionString = process.env.CONNECTION_STRING || "";

const seedHotels = async () => {
  try {
    await mongoose.connect(connectionString);
    console.log("MongoDB connected");

    // Clear existing hotels
    await Hotel.deleteMany({});
    console.log("Cleared existing hotels");

    // Create sample hotels
    const hotels = [
      {
        name: "Luxury Grand Hotel",
        location: "New York, NY",
        description: "Experience luxury at the heart of Manhattan",
        rooms: [
          { type: "Single", price: 150, totalRooms: 20 },
          { type: "Double", price: 200, totalRooms: 30 },
          { type: "Suite", price: 350, totalRooms: 10 },
        ],
      },
      {
        name: "Beach Paradise Resort",
        location: "Miami, FL",
        description: "Enjoy sun, sand, and sea at our beachfront resort",
        rooms: [
          { type: "Single", price: 120, totalRooms: 25 },
          { type: "Double", price: 180, totalRooms: 35 },
          { type: "Deluxe", price: 300, totalRooms: 15 },
        ],
      },
      {
        name: "Mountain Retreat Lodge",
        location: "Denver, CO",
        description: "Relax in the heart of the mountains",
        rooms: [
          { type: "Single", price: 100, totalRooms: 15 },
          { type: "Double", price: 160, totalRooms: 25 },
          { type: "Suite", price: 280, totalRooms: 8 },
        ],
      },
      {
        name: "Urban City Hotel",
        location: "Los Angeles, CA",
        description: "Modern comfort in the city that never sleeps",
        rooms: [
          { type: "Single", price: 110, totalRooms: 30 },
          { type: "Double", price: 170, totalRooms: 40 },
          { type: "Suite", price: 320, totalRooms: 12 },
        ],
      },
      {
        name: "Historic Downtown Inn",
        location: "Boston, MA",
        description: "Charming accommodation with historic charm",
        rooms: [
          { type: "Single", price: 130, totalRooms: 20 },
          { type: "Double", price: 190, totalRooms: 28 },
          { type: "Deluxe", price: 290, totalRooms: 10 },
        ],
      },
    ];

    const createdHotels = await Hotel.insertMany(hotels);
    console.log(`${createdHotels.length} hotels created successfully`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding hotels:", error);
    process.exit(1);
  }
};

seedHotels();
