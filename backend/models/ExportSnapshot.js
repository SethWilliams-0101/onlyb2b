const mongoose = require('mongoose');

const exportSnapshotSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'AuthAccount', index: true },
    username: { type: String, index: true },

    // what they exported
    format: { type: String, enum: ['csv', 'xlsx'], required: true },
    fields: [{ type: String }],          // selected fields (if any)
    filters: { type: Object },           // search + multi-filters used

    total: { type: Number, required: true }, // how many rows were exported

    // exact records (by _id from Users collection)
    itemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

exportSnapshotSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ExportSnapshot', exportSnapshotSchema);
