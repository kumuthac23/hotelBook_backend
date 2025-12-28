# Backend — Hotel Booking

**Setup Instructions**

- **Prerequisites:** Node.js, npm, a MongoDB connection (Atlas).
- **Environment variables:** create a `.env` file in the backend root with:

  - `CONNECTION_STRING` — MongoDB connection
  - `JWT_SECRET` — JWT signing secret
  - `PORT` — optional, default 3000

- **Install deps:**

```bash
npm install
```

- **Run locally (development):**

```bash
npm run dev
```

- **Run production:**

```bash
npm start
```

**Deployment URLs**

- Backend deployed on Railway
  - `https://hotelbookbackend.up.railway.app/`
- API base path: `https://hotelbookbackend.up.railway.app/api`

**Assumptions made**

- Authentication uses JWT. Protected routes expect an `Authorization: Bearer <token>` header. See `middleware/auth.js` for implementation.
- Room types are enumerated in the hotel model as `Single`, `Double`, `Suite`, `Deluxe`.
- Bookings have a `status` field which can be `Booked` or `Cancelled`; only `Booked` bookings occupy rooms.
- Dates are stored as ISO `Date` objects.
- Prices and totals are calculated in the backend; client should display and rely on backend totals.

**Room availability logic (implementation details)**

- Models involved:
  - Hotel: [database/models/hotel.js](database/models/hotel.js)
  - Booking: [database/models/booking.js](database/models/booking.js)
- Controllers:
  - Availability check: [controllers/api/hotelController.js](controllers/api/hotelController.js)
  - Booking creation: [controllers/api/bookingController.js](controllers/api/bookingController.js)

Algorithm (as implemented):

1. Fetch the requested `hotel` and locate the requested `roomType` to get `room.totalRooms` and `room.price`.
2. Convert requested `checkInDate` and `checkOutDate` to `Date` objects.
3. Count existing bookings that overlap the requested date range and are still `Booked`:
   - Overlap condition used:
     - existing booking `checkInDate` < requested `checkOutDate` AND
     - existing booking `checkOutDate` > requested `checkInDate`
   - This is implemented with a MongoDB query using `$or` and comparisons (see controllers linked above).
4. Compute `availableRooms = room.totalRooms - bookedRooms`.
5. If `availableRooms < numberOfRooms` then the request is rejected with a 400 status and a message showing how many rooms are available.
6. When creating a booking, the backend also computes `days = ceil((checkOut - checkIn) / (1000*60*60*24))` and then `totalPrice = room.price * numberOfRooms * days`.

Notes about the overlap logic:

- The overlap condition counts any existing booking that shares at least one night with the requested range.
- Cancelled bookings (`status: "Cancelled"`) are excluded from the count, so they free up rooms.

**Key API endpoints (backend-focused)**

- `GET /api/hotels` — list hotels
- `GET /api/hotels/:id` — get hotel details
- `POST /api/hotels/check-availability` — check availability for a hotel room type (body: `hotelId, roomType, checkInDate, checkOutDate, numberOfRooms`)
- `POST /api/hotels/create` — create a hotel (admin usage)
- `POST /api/bookings` — create a booking (protected; body: see controller)
- `GET /api/bookings/my` — list bookings for authenticated user (protected)
- `GET /api/bookings/:id` — get a single booking (protected)
- `PUT /api/bookings/:id/cancel` — cancel a booking (protected)

---
