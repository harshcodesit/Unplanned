# Unplanned 

A hyperlocal web application to discover, create, and join spontaneous real-world meetups and micro-adventures ("Vibes"). Users can explore nearby activities within a selected radius on an interactive radar, send join requests, and track their adventure history through a personal trail log.


**Live Demo:** [https://unplanned-eight.vercel.app/](https://unplanned-eight.vercel.app/)

---

##  What is Unplanned?

I built **Unplanned** to solve the friction of spontaneous, local plans. Instead of coordinating across endless group chats, anyone can post a spontaneous plan (e.g., late-night coffee run, weekend trail hike, street photography walk) with a specified meetup radius, date, time, and participant limit.

### Key Features
- **Radius-Based Exploration:** Search events near your current GPS location with selectable radiuses (5 km, 10 km, 25 km, 50 km).
- **Privacy-First Location Fuzzing:** To prevent location scraping and stalking, public users only see an approximate ~1 km safe radius on Google Maps. Exact coordinates and location names are unlocked only for the host and accepted attendees.
- **Participation Workflows:** Users send join requests to the host. The host can review applicant profiles and accept or reject them with real-time capacity tracking.
- **Trail Chronicles:** A personal activity log split into **Sparks Hosted** (events you organized) and **Footprints Joined** (adventures you attended).
- **Secure Authentication:** Cookie-based session management using JWTs stored in `httpOnly` cookies with full password hashing (`bcryptjs`).
- **Cloud Media Uploads:** Multi-image uploads handled through Multer and streamed directly to Cloudinary.

---

##  System Architecture & Data Flow

```
[ Client Tier: React 19 + TypeScript SPA ]
   │
   ├── Public Traffic ──► [ React Router v7 + Suspense + Lazy Chunks ]
   ├── State Layers   ──► [ AuthContext (Session) + ToastContext (Feedback) ]
   └── Network Layer  ──► [ Axios Instance: withCredentials=true ]
                               │
                               ▼ (HTTPS / JSON / Multipart Form)
[ API Gateway & Server Tier: Express 5 + Node.js ]
   │
   ├── Global Middleware  ──► [ Helmet Security Headers + CORS Whitelist + Cookie-Parser ]
   ├── Health Probe       ──► [ GET /health: 200 OK (Keep-Warm Probe) ]
   ├── Authentication     ──► [ verifyToken & optionalVerifyToken (JWT in httpOnly Cookie) ]
   ├── File Pipeline      ──► [ Multer ──► Cloudinary CDN Storage ]
   └── Service Handlers   ──► [ User, Vibe, Request, and Trail Controllers ]
                               │
                               ▼ (Mongoose ODM / TCP Socket)
[ Database Tier: MongoDB Atlas ]
   ├── users Collection     (Bcrypt Hashed Credentials, Embedded References)
   ├── vibes Collection     (GeoJSON Point Geometry + 2dsphere Spatial Index)
   └── requests Collection  (Junction Collection: Atomic Capacity & State Machine)
```

---

##  Architectural Highlights

1. **MongoDB Geospatial Proximity Search:**
   Vibes store coordinates in GeoJSON format (`[longitude, latitude]`). Queries use MongoDB's `$near` operator against a `2dsphere` index with `$maxDistance` calculated in meters:
   ```javascript
   query.geometry = {
     $near: {
       $geometry: {
         type: "Point",
         coordinates: [parseFloat(lng), parseFloat(lat)],
       },
       $maxDistance: radiusInKm * 1000,
     },
   };
   ```

2. **Backend-Enforced Privacy Masking:**
   Instead of just hiding coordinates with CSS, the backend controller sanitizes output before sending it to the client. If `req.user` is neither the creator nor an accepted participant, exact latitude and longitude are omitted and replaced with the approximate center of the safe zone.

3. **HTTP-Only Cookie Authentication:**
   Tokens are stored in `httpOnly`, `secure`, `sameSite` cookies instead of `localStorage`. This prevents token exfiltration via Cross-Site Scripting (XSS).

4. **Keep-Alive Health Endpoint:**
   Because free-tier Render instances sleep after 15 minutes of inactivity, a lightweight `GET /health` endpoint returns `200 OK` without hitting the database. This allows a free cron pinger (e.g. UptimeRobot) to ping every 14 minutes and prevent cold starts.

---

## 🛠️ Complete Technology Stack

| Layer | Technology | Usage / Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19.2 | Modern UI library utilizing functional components and hooks |
| | TypeScript 6.0 | End-to-end static type safety and shared data contracts |
| | Vite 8.3 | High-speed ESM build tool, bundling, and hot module replacement |
| | React Router 7.18 | Declarative client-side routing, protected routes, and lazy loading |
| | Google Maps Platform | Interactive spatial radar and location rendering (`@vis.gl/react-google-maps`) |
| | Lucide React | Modern, accessible SVG iconography |
| | Custom Vanilla CSS | Tailored, lightweight design system without heavy framework runtime overhead |
| **Backend** | Node.js 18+ | Event-driven JavaScript server runtime |
| | Express 5.2 | RESTful API framework with modular routing and robust middleware chaining |
| | Mongoose 9.9 | Object Data Modeling (ODM) with validation schemas and indexing |
| | JSON Web Token (JWT) | Stateless session tokens signed and verified via private secret |
| | Cookie-Parser | Parsing signed HTTP cookie headers into `req.cookies` |
| | Helmet 8.3 | Automated HTTP security headers suite |
| | Multer & Cloudinary | Multi-part form stream handling and persistent cloud media hosting |
| **Database** | MongoDB Atlas | Cloud-hosted NoSQL document database with geospatial query support |

---

---

##  Project Structure

```
Unplanned/
├── Backend/
│   ├── config/
│   │   ├── db.js              # MongoDB Atlas connection
│   │   └── multer.js          # Cloudinary storage configuration
│   ├── controllers/
│   │   ├── userController.js  # Auth, profile, and password management
│   │   ├── vibeContoller.js   # Geospatial queries and vibe lifecycle
│   │   ├── requestController.js # Join request approvals & attendee limits
│   │   └── trailController.js # Hosted vs joined activity history
│   ├── middlewares/
│   │   ├── jwt.js             # verifyToken & optionalVerifyToken
│   │   └── uploads.js         # Multer array upload handler
│   ├── models/
│   │   ├── user.js            # User schema & bcrypt password hashing
│   │   ├── vibe.js            # 2dsphere indexed vibe schema
│   │   └── request.js         # Junction collection for join requests
│   ├── routes/                # Express API routes
│   └── app.js                 # Express server & middleware setup
│
└── Frontend/unplanned/
    ├── src/
    │   ├── api/               # Axios instance configuration
    │   ├── components/        # Layout, Navbar, Footer, ProtectedRoute, ErrorBoundary
    │   ├── context/           # AuthContext and ToastContext
    │   ├── pages/             # Home, VibesFeed, VibeDetails, VibeCreate, Trail, Profile, Login, Register
    │   ├── types/             # TypeScript definitions (vibe, user, trail)
    │   ├── App.tsx            # Routes with code-splitting
    │   ├── main.tsx           # React entry point
    │   └── index.css          # Design system variables and global styles
    └── vite.config.ts
```

---

##  Getting Started Locally

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas database (or a local MongoDB instance)
- Cloudinary account (for image uploads)
- Google Maps API key (with Maps JavaScript API enabled)

---

### 1. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` directory:

```env
PORT=3000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start the backend server:

```bash
npm run dev
# or: node app.js
```

The server should start on `http://localhost:3000`. You can test `http://localhost:3000/health` in your browser to verify it's working.

---

### 2. Frontend Setup

In a new terminal window:

```bash
cd Frontend/unplanned
npm install
```

Create a `.env` file in `Frontend/unplanned`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Start the Vite development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

##  Production Build & Testing

To test the frontend TypeScript compilation and production bundle:

```bash
cd Frontend/unplanned
npm run build
```

This runs `tsc -b` and builds optimized static assets in `dist/`.

---

##  License

This project is open-source and available under the [MIT License](LICENSE).
