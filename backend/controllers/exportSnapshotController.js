const ExportSnapshot = require('../models/ExportSnapshot');
const User = require('../models/User');

// Create a snapshot record after an export
async function createExportSnapshot({ reqUser, format, fields, filters, users }) {
  const snap = await ExportSnapshot.create({
    userId: reqUser?.id || null,
    username: reqUser?.username || 'unknown',
    format,
    fields: Array.isArray(fields) ? fields : (fields ? String(fields).split(',') : []),
    filters: filters || {},
    total: users.length,
    itemIds: users.map((u) => u._id),
  });
  return snap;
}

// GET /api/exports  (list snapshots; admin/auditor + audit code handled at route)
async function listSnapshots(req, res) {
  const { username, page = 1, limit = 20 } = req.query;
  const q = {};
  if (username) q.username = username;

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    ExportSnapshot.find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    ExportSnapshot.countDocuments(q),
  ]);
  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
}

// GET /api/exports/:id  (snapshot meta)
async function getSnapshot(req, res) {
  const snap = await ExportSnapshot.findById(req.params.id);
  if (!snap) return res.status(404).json({ message: 'Not found' });
  res.json(snap);
}

// GET /api/exports/:id/items  (exact exported rows, paginated)
async function getSnapshotItems(req, res) {
  const { id } = req.params;
  const { page = 1, limit = 100 } = req.query;

  const snap = await ExportSnapshot.findById(id);
  if (!snap) return res.status(404).json({ message: 'Not found' });

  const start = (Number(page) - 1) * Number(limit);
  const end = start + Number(limit);
  const pageIds = snap.itemIds.slice(start, end);

  const users = await User.find({ _id: { $in: pageIds } });
  // keep original order
  const order = new Map(pageIds.map((v, i) => [String(v), i]));
  users.sort((a, b) => order.get(String(a._id)) - order.get(String(b._id)));

  res.json({
    snapshotId: snap._id,
    fields: snap.fields,
    total: snap.total,
    page: Number(page),
    items: users,
  });
}

module.exports = { createExportSnapshot, listSnapshots, getSnapshot, getSnapshotItems };
