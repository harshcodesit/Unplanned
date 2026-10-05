require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoute");
const vibeRoutes = require("./routes/vibeRoute");
const requestRoutes = require("./routes/requestRoute");
const trailRoutes = require("./routes/trailRoute");

require("./models/user");
require("./models/vibe");
require("./models/request");

const app = express();
connectDB();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",").map((url) => url.trim()) : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        callback(null, true);
      } else {
        callback(new Error("CORS blocked for origin: " + origin));
      }
    },
    credentials: true,
  })
);

app.get("/health", (req, res) => res.status(200).send("OK"));
app.get("/api/health", (req, res) => res.status(200).send("OK"));
app.get("/", (req, res) => {
  res.send("Unplanned API is running.");
});

app.use("/api/user", userRoutes);
app.use("/api/vibes", vibeRoutes);
app.use("/api/vibes/:vibeId/request", requestRoutes);
app.use("/api/trail", trailRoutes);

app.use((err, req, res, next) => {
  console.error("Unhandled API Error:", err);
  return res.status(500).json({ error: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});