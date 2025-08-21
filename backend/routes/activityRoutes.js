const express = require('express');
const Activity = require('../models/Activity');
const { verifyJWT, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/activities  (secured with role + audit code header)
router.get('/', verifyJWT, requireRole('admin', 'auditor'), async (req, res) => {
  const code = req.headers['x-audit-code'];
  if (!code || code !== process.env.AUDIT_ACCESS_CODE) {
    return res.status(401).json({ message: 'Invalid audit code' });
  }

  const { q = '', page = 1, limit = 25, username } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter = {};
  if (username) filter.username = username;
  if (q) {
    filter.$or = [
      { action: new RegExp(q, 'i') },
      { route: new RegExp(q, 'i') },
      { method: new RegExp(q, 'i') },
    ];
  }

  const [items, total] = await Promise.all([
    Activity.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Activity.countDocuments(filter),
  ]);

  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

module.exports = router;
