// backend/routes/duplicateRoutes.js
const express = require('express');
const { verifyJWT, requireRole } = require('../middleware/auth');
const { listDuplicateGroups, listDuplicateItems } = require('../controllers/duplicatesController');

const router = express.Router();

// Admin/Auditor + audit code (same gate as /activities, /exports)
router.use(verifyJWT, requireRole('admin', 'auditor'), (req, res, next) => {
  const code = req.headers['x-audit-code'];
  if (!code || code !== process.env.AUDIT_ACCESS_CODE) {
    return res.status(401).json({ message: 'Invalid audit code' });
  }
  next();
});

router.get('/groups', listDuplicateGroups);
router.get('/items', listDuplicateItems);

module.exports = router;
