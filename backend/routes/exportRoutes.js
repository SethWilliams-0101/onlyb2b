const express = require('express');
const { verifyJWT, requireRole } = require('../middleware/auth');
const { listSnapshots, getSnapshot, getSnapshotItems } = require('../controllers/exportSnapshotController');

const router = express.Router();

// All endpoints: admin/auditor + special audit code header (same as /activities)
router.use(verifyJWT, requireRole('admin', 'auditor'), (req, res, next) => {
  const code = req.headers['x-audit-code'];
  if (!code || code !== process.env.AUDIT_ACCESS_CODE) {
    return res.status(401).json({ message: 'Invalid audit code' });
  }
  next();
});

router.get('/', listSnapshots);
router.get('/:id', getSnapshot);
router.get('/:id/items', getSnapshotItems);

module.exports = router;
