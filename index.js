const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const routes = require("./Routes/routes");
const authRoutes = require("./Routes/authRoute");
const otpRoutes = require("./Routes/otpRoutes");

dotenv.config();

const app = express();

// MongoDB connection
mongoose.connect(process.env.URL)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => console.log("MongoDB connection error:", error));

app.use(cors());
app.use(express.json());

// Test categorizeItem (runs once on startup)


app.use("/apis", routes);
app.use("/auth", authRoutes);
app.use("/otps", otpRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
