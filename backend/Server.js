const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

const Farmer = require("./models/farmer");

const app = express();

/** CORS (allow your GitHub Pages frontend) 
 * For quick start we allow all. Later, set ALLOWED_ORIGIN to your GH Pages URL.
 */
const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

// Cloudinary setup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer: keep files in memory and stream to Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI, { dbName: "krishiDB" })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ Mongo Error:", err.message);
    process.exit(1);
  });

// Helper to upload a buffer to Cloudinary
function uploadBufferToCloudinary(buffer, folder = "krishi/farmers") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// Health check
app.get("/", (_req, res) => res.send("KRISHI backend running ✅"));

// Signup (multipart/form-data: fields + optional photo)
app.post("/signup", upload.single("photo"), async (req, res) => {
  try {
    const { name, age, phone, aadhaar, email, password } = req.body;
    if (!name || !age || !phone || !aadhaar || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const exists = await Farmer.findOne({ $or: [{ email }, { phone }, { aadhaar }] });
    if (exists) return res.status(400).json({ error: "User already exists (email/phone/aadhaar)" });

    const hashed = await bcrypt.hash(password, 10);

    let photoUrl = null;
    if (req.file && req.file.buffer) {
      const up = await uploadBufferToCloudinary(req.file.buffer);
      photoUrl = up.secure_url;
    }

    const farmer = await Farmer.create({
      name, age, phone, aadhaar, email,
      password: hashed,
      photoUrl
    });

    res.json({
      message: "Signup successful",
      user: { id: farmer._id, name: farmer.name, email: farmer.email, photoUrl: farmer.photoUrl }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login (JSON: { email, password })
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const farmer = await Farmer.findOne({ email });
    if (!farmer) return res.status(400).json({ error: "User not found" });

    const ok = await bcrypt.compare(password, farmer.password);
    if (!ok) return res.status(400).json({ error: "Invalid password" });

    res.json({
      message: "Login successful",
      user: { id: farmer._id, name: farmer.name, email: farmer.email, photoUrl: farmer.photoUrl }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 10000; // Render supplies PORT automatically
app.listen(PORT, () => console.log('🚀 Server on port ${PORT}'));

require("dotenv").config();