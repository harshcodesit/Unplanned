require("dotenv").config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db.js');
const userRoutes = require('./routes/userRoute.js');
const vibeRoutes = require('./routes/vibeRoute.js');
const requestRoutes = require('./routes/requestRoute.js');
const trailRoutes = require('./routes/trailRoute.js');

require("./models/user.js");
require("./models/vibe.js");
require("./models/request.js");



const app = express();
connectDB();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cookieParser());
const corsOptions = {
    origin: 'http://localhost:5173', // Replace with your frontend URL
    credentials: true, // Allow cookies to be sent
};
// app.use(cors(corsOptions));



app.get("/",(req,res)=>{
    console.log("hello world");
    res.send("Hello World!");
});

app.use("/api/user",userRoutes);
app.use("/api/vibes", vibeRoutes);
app.use("/api/vibes/:vibeId/request", requestRoutes);
app.use("/api/trail", trailRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});