const express = require('express');
const UploadReport = require('../models/UploadReport');
const { verifyJWT } = require('../middleware/auth');

const router = express.Router();

// GET /api/upload-reports/:id  (uploader OR admin/auditor can view)
router.get('/:id', verifyJWT, async (req, res) => {
  const r = await UploadReport.findById(req.params.id).lean();
  if (!r) return res.status(404).json({ message: 'Report not found' });

  const isAdminOrAud = ['admin', 'auditor'].includes(req.user.role);
  const isOwner = String(r.userId || '') === String(req.user.id || '');
  if (!isAdminOrAud && !isOwner) return res.status(403).json({ message: 'Forbidden' });

  res.json(r);
});

module.exports = router;
