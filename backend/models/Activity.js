const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'AuthAccount', index: true },
    username: { type: String, index: true },
    action: { type: String, required: true },   // e.g., LOGIN, UPLOAD_CSV, API_CALL
    method: { type: String },
    route: { type: String },
    status: { type: Number },
    meta: { type: Object },
    ip: { type: String },
    ua: { type: String },
  },
  { timestamps: true }
);

activitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
