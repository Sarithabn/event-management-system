# ◈ EventSphere — Full-Stack Event Management Platform

A production-ready alternative to Hi.Events, built with React, Node.js, Express, and MongoDB.

---

## 🏗️ Project Architecture

```
EventSphere
├── client/          ← React.js Frontend (Port 3000)
└── server/          ← Node.js + Express Backend (Port 5000)
```

### Tech Stack

| Layer     | Technology                                 |
|-----------|--------------------------------------------|
| Frontend  | React 18, React Router v6, Context API, Axios |
| Backend   | Node.js, Express.js                        |
| Database  | MongoDB + Mongoose ODM                     |
| Auth      | JWT (JSON Web Tokens) + bcryptjs           |
| QR Code   | `qrcode` (generation) + `jsQR` (scanning) |

---

## 📁 Full Folder Structure

```
eventsphere/
├── package.json                    ← Root monorepo scripts
│
├── server/
│   ├── index.js                    ← Express entry point
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   └── db.js                   ← MongoDB connection
│   ├── models/
│   │   ├── User.js                 ← User schema (admin/organizer/user)
│   │   ├── Event.js                ← Event schema
│   │   ├── Ticket.js               ← Ticket types schema
│   │   └── Booking.js              ← Booking + QR schema
│   ├── controllers/
│   │   ├── authController.js       ← Register, Login, Profile
│   │   ├── eventController.js      ← CRUD + My Events
│   │   ├── ticketController.js     ← Ticket management
│   │   ├── bookingController.js    ← Book, Cancel, Check-in
│   │   └── adminController.js      ← Admin stats, user/event mgmt
│   ├── routes/
│   │   ├── auth.js
│   │   ├── events.js
│   │   ├── tickets.js
│   │   ├── bookings.js
│   │   ├── admin.js
│   │   ├── users.js
│   │   └── qr.js
│   └── middleware/
│       └── auth.js                 ← JWT protect + role authorize
│
└── client/
    ├── package.json
    ├── .env.example
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js                  ← All routes defined
        ├── index.js
        ├── styles/
        │   └── global.css          ← Complete design system
        ├── context/
        │   ├── AuthContext.js      ← Global auth state
        │   └── NotifContext.js     ← Toast notifications
        ├── hooks/
        │   └── useHooks.js         ← useFetch, useAsync, useDebounce
        ├── services/
        │   └── api.js              ← All Axios API calls
        ├── utils/
        │   └── helpers.js          ← formatDate, formatCurrency, etc.
        ├── components/
        │   ├── common/
        │   │   ├── ProtectedRoute.js
        │   │   ├── Spinner.js
        │   │   ├── Toast.js
        │   │   └── Modal.js
        │   ├── layout/
        │   │   ├── Navbar.js
        │   │   ├── Footer.js
        │   │   ├── Sidebar.js
        │   │   └── DashboardLayout.js
        │   ├── events/
        │   │   ├── EventCard.js
        │   │   └── EventForm.js
        │   ├── tickets/
        │   │   └── TicketForm.js
        │   ├── booking/
        │   │   └── BookingCard.js
        │   └── qr/
        │       └── QRScanner.js
        └── pages/
            ├── Home.js
            ├── auth/
            │   ├── Login.js
            │   └── Register.js
            ├── events/
            │   ├── EventsList.js
            │   ├── EventDetail.js
            │   ├── CreateEditEvent.js
            │   ├── ManageTickets.js
            │   └── EventBookings.js
            ├── dashboard/
            │   ├── UserDashboard.js
            │   ├── OrganizerDashboard.js
            │   ├── MyBookings.js
            │   ├── BookingDetail.js
            │   ├── Profile.js
            │   └── QRCheckIn.js
            └── admin/
                ├── AdminDashboard.js
                ├── AdminUsers.js
                └── AdminEvents.js
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

---

### Step 1 — Clone / Copy the project

```bash
# If using git
git clone <your-repo-url>
cd eventsphere

# Or just navigate to the project directory
cd eventsphere
```

---

### Step 2 — Install all dependencies

```bash
# Install root dependencies (concurrently)
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install

# OR from root, run:
npm run install-all
```

---

### Step 3 — Configure environment variables

**Server (`server/.env`):**
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/eventsphere
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**Client (`client/.env`):**
```bash
cd client
cp .env.example .env
```

Edit `client/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=EventSphere
```

---

### Step 4 — Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Atlas** — replace MONGO_URI with your Atlas connection string.

---

### Step 5 — Seed demo users (optional but recommended)

Create a `server/seed.js` file and run it to create demo accounts:

```js
// server/seed.js
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({});
  await User.create([
    { name: 'Admin User', email: 'admin@eventsphere.com', password: 'admin123', role: 'admin' },
    { name: 'Event Organizer', email: 'organizer@eventsphere.com', password: 'org123', role: 'organizer' },
    { name: 'John User', email: 'user@eventsphere.com', password: 'user123', role: 'user' },
  ]);
  console.log('✅ Seeded 3 demo users');
  process.exit(0);
};
seed();
```

```bash
cd server
node seed.js
```

---

### Step 6 — Run the application

**Development (both frontend + backend concurrently):**
```bash
# From project root
npm run dev
```

**Or run separately:**

Terminal 1 (Backend):
```bash
cd server
npm run dev   # Uses nodemon for hot reload
```

Terminal 2 (Frontend):
```bash
cd client
npm start
```

---

### Step 7 — Open in browser

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api/health

---

## 🔐 Demo Accounts

After running the seed script:

| Role       | Email                          | Password  |
|------------|--------------------------------|-----------|
| Admin      | admin@eventsphere.com          | admin123  |
| Organizer  | organizer@eventsphere.com      | org123    |
| User       | user@eventsphere.com           | user123   |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint                    | Access  | Description          |
|--------|-----------------------------|---------|----------------------|
| POST   | `/api/auth/register`        | Public  | Register new user    |
| POST   | `/api/auth/login`           | Public  | Login & get JWT      |
| GET    | `/api/auth/me`              | Private | Get current user     |
| PUT    | `/api/auth/profile`         | Private | Update profile       |
| PUT    | `/api/auth/change-password` | Private | Change password      |

### Events
| Method | Endpoint                  | Access          | Description          |
|--------|---------------------------|-----------------|----------------------|
| GET    | `/api/events`             | Public          | List/search events   |
| GET    | `/api/events/featured`    | Public          | Featured events      |
| GET    | `/api/events/my-events`   | Organizer/Admin | Own events           |
| GET    | `/api/events/:id`         | Public          | Get single event     |
| POST   | `/api/events`             | Organizer/Admin | Create event         |
| PUT    | `/api/events/:id`         | Organizer/Admin | Update event         |
| DELETE | `/api/events/:id`         | Organizer/Admin | Delete event         |

### Tickets
| Method | Endpoint                       | Access          | Description     |
|--------|--------------------------------|-----------------|-----------------|
| GET    | `/api/tickets/event/:eventId`  | Public          | Event tickets   |
| POST   | `/api/tickets`                 | Organizer/Admin | Create ticket   |
| PUT    | `/api/tickets/:id`             | Organizer/Admin | Update ticket   |
| DELETE | `/api/tickets/:id`             | Organizer/Admin | Delete ticket   |

### Bookings
| Method | Endpoint                          | Access          | Description           |
|--------|-----------------------------------|-----------------|-----------------------|
| POST   | `/api/bookings`                   | User+           | Create booking        |
| GET    | `/api/bookings/my`                | User+           | My bookings           |
| GET    | `/api/bookings/:id`               | User+           | Single booking + QR   |
| GET    | `/api/bookings/event/:eventId`    | Organizer/Admin | Event bookings        |
| PUT    | `/api/bookings/:id/cancel`        | User+           | Cancel booking        |
| POST   | `/api/bookings/check-in`          | Organizer/Admin | QR check-in           |

### Admin
| Method | Endpoint                      | Access | Description        |
|--------|-------------------------------|--------|--------------------|
| GET    | `/api/admin/stats`            | Admin  | Platform stats     |
| GET    | `/api/admin/users`            | Admin  | All users          |
| PUT    | `/api/admin/users/:id`        | Admin  | Update user        |
| DELETE | `/api/admin/users/:id`        | Admin  | Delete user        |
| GET    | `/api/admin/events`           | Admin  | All events         |
| PUT    | `/api/admin/events/:id/feature` | Admin | Feature event    |

---

## 🗃️ Database Schema

### User
```
name, email, password (hashed), role (admin|organizer|user),
avatar, phone, isActive, createdAt
```

### Event
```
title, description, category, organizer (ref), venue {name,address,city,state,country,zipCode},
startDate, endDate, startTime, endTime, coverImage, status (draft|published|cancelled|completed),
isFeatured, tags[], totalCapacity, bookedCount, createdAt
```

### Ticket
```
event (ref), name, description, type (free|paid), price, currency,
totalQuantity, soldQuantity, maxPerBooking, saleStartDate, saleEndDate,
isActive, createdAt
```

### Booking
```
bookingRef (unique), user (ref), event (ref), ticket (ref),
quantity, unitPrice, totalAmount, currency,
status (confirmed|cancelled|pending|attended),
attendees [{name, email}], qrCode (base64), checkedIn, checkedInAt,
cancelledAt, cancelReason, paymentMethod, createdAt
```

---

## ✨ Features Summary

| Feature                   | Status |
|---------------------------|--------|
| JWT Authentication        | ✅ |
| Role-based access control | ✅ |
| Event CRUD                | ✅ |
| Ticket types (free/paid)  | ✅ |
| Booking system + QR code  | ✅ |
| Booking cancellation      | ✅ |
| QR code scanner (camera)  | ✅ |
| Admin dashboard + analytics | ✅ |
| User management           | ✅ |
| Event featuring           | ✅ |
| Search & category filter  | ✅ |
| Pagination                | ✅ |
| Responsive design         | ✅ |
| Toast notifications       | ✅ |
| Dark theme                | ✅ |

---

## 🛠️ Production Build

```bash
# Build React frontend
cd client
npm run build

# The build folder can be served by Express
# Add this to server/index.js for production:
# const path = require('path');
# app.use(express.static(path.join(__dirname, '../client/build')));
# app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/build/index.html')));
```

---

## 📝 Notes

- Payment integration (Razorpay/Stripe) can be added in `bookingController.js`
- Email notifications can be added using Nodemailer
- Image upload can be implemented with Multer + Cloudinary
- The QR scanner requires camera permissions in the browser
