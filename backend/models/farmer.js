const mongoose = require("mongoose");

const farmerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    phone: { type: String, required: true, unique: true },
    aadhaar: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },   // hashed
    photoUrl: { type: String, default: null }     // Cloudinary URL
  },
  { timestamps: true }
);

module.exports = mongoose.model("Farmer", farmerSchema);
