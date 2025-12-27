const express = require("express");
require("dotenv").config();
var cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
var cors = require("cors");
const session = require("express-session");

const app = express();

const PORT = process.env.PORT || 3000;
const connectionString = process.env.CONNECTION_STRING || "";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: "Password",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000,
      httpOnly: true,
    },
  })
);
var authRouter = require("./routes/auth");
var hotelRouter = require("./routes/hotels");
var bookingRouter = require("./routes/bookings");

// CORS Configuration
app.use((req, res, next) => {
  const allowedOriginsWithCredentials = ["http://localhost:5173"];

  const isAllowedWithCredentials = allowedOriginsWithCredentials.some(
    (origin) => req.headers.origin === origin
  );
  if (isAllowedWithCredentials) {
    cors({
      origin: req.headers.origin,
      credentials: true,
    })(req, res, next);
  } else {
    cors()(req, res, next);
  }
});

// Handle preflight requests
app.options("*", cors());

mongoose
  .connect(connectionString)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

app.use("/api/auth", authRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/bookings", bookingRouter);

//these middleware should at last but before error handlers
app.use("*", (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on the server`);
  err.status = "fail";
  err.statusCode = 404;

  next(err);
});

//Error handling middleware
app.use((error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";
  console.log(error);
  res.status(error.statusCode).json({
    statusCode: error.statusCode,
    status: error.status,
    message: error.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
