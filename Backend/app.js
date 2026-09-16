require("dotenv").config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const validateEnv = require('./config/validateEnv.js');
const connectDB = require('./config/db.js');
const userRoutes = require('./routes/userRoute.js');
const vibeRoutes = require('./routes/vibeRoute.js');
const requestRoutes = require('./routes/requestRoute.js');
const trailRoutes = require('./routes/trailRoute.js');

require("./models/user.js");
require("./models/vibe.js");
require("./models/request.js");


validateEnv();

const app = express();
connectDB();


app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(compression());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",").map((url) => url.trim()) : []),
];

const corsOptions = {
  origin: (origin, callback) => {

    if (!origin) return callback(null, true);

    const isAllowed =
      allowedOrigins.includes(origin) ||
      /\.vercel\.app$/.test(origin) ||
      (process.env.CLIENT_URL && origin === process.env.CLIENT_URL);

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};
app.use(cors(corsOptions));


const healthHandler = (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
};
app.get("/health", healthHandler);
app.get("/api/health", healthHandler);

app.get("/", (req, res) => {
  res.send("Unplanned API is running.");
});


app.use("/api/user", userRoutes);
app.use("/api/vibes", vibeRoutes);
app.use("/api/vibes/:vibeId/request", requestRoutes);
app.use("/api/trail", trailRoutes);


app.use((err, req, res, next) => {
  if (err.message && err.message.includes("CORS blocked")) {
    return res.status(403).json({ error: err.message });
  }
  console.error("Unhandled API Error:", err);
  return res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});