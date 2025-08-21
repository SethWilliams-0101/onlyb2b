const Activity = require('../models/Activity');

const activityLogger = (label = 'API_CALL') => (req, res, next) => {
  const started = Date.now();
  res.on('finish', async () => {
    try {
      const u = req.user || {};
      await Activity.create({
        userId: u.id || null,
        username: u.username || 'guest',
        action: label,
        method: req.method,
        route: req.originalUrl,
        status: res.statusCode,
        meta: { durationMs: Date.now() - started },
        ip: req.ip,
        ua: req.headers['user-agent'],
      });
    } catch (e) {
      console.error('activity log error:', e.message);
    }
  });
  next();
};

module.exports = { activityLogger };
