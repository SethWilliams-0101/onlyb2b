const express = require('express');
const { verifyJWT, requireRole } = require('../middleware/auth');
const Activity = require('../models/Activity');
const ExportSnapshot = require('../models/ExportSnapshot');
const User = require('../models/User');

const router = express.Router();

// All admin endpoints: admin/auditor + audit code
router.use(verifyJWT, requireRole('admin', 'auditor'), (req, res, next) => {
  const code = req.headers['x-audit-code'];
  if (!code || code !== process.env.AUDIT_ACCESS_CODE) {
    return res.status(401).json({ message: 'Invalid audit code' });
  }
  next();
});

// GET /api/admin/stats
router.get('/stats', async (_req, res) => {
  const [totalUsers, totalActivities, totalExports] = await Promise.all([
    User.countDocuments(),
    Activity.countDocuments(),
    ExportSnapshot.countDocuments()
  ]);

  const recentActivities = await Activity.find({})
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const recentExports = await ExportSnapshot.find({})
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  // Top actors & action breakdown (last 7 days)
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [topActors, actionBreakdown] = await Promise.all([
    Activity.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$username', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]),
    Activity.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
  ]);

  res.json({
    totals: { users: totalUsers, activities: totalActivities, exports: totalExports },
    recentActivities,
    recentExports,
    topActors,
    actionBreakdown
  });
});

module.exports = router;
