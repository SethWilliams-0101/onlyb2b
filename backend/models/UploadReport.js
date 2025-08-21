const mongoose = require('mongoose');

const uploadReportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'AuthAccount' },
    username: String,
    filename: String,

    processed: Number,
    inserted: Number,
    updated: Number,

    // duplicates within the uploaded file (by EmailID)
    duplicatesInFile: [{ EmailID: String, count: Number }],

    // rows that already existed in DB before this upload (by EmailID)
    duplicatesExisting: [String],
  },
  { timestamps: true }
);

uploadReportSchema.index({ createdAt: -1 });

module.exports = mongoose.model('UploadReport', uploadReportSchema);
