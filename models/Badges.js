const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
  iconUrl: { type: String }, // You can store the badge's icon URL if necessary
});

const Badge = mongoose.model("Badge", badgeSchema);
module.exports = Badge;
