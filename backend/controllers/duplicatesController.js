// backend/controllers/duplicatesController.js
const User = require('../models/User');

// Build aggregation to find duplicate groups
function buildPipeline(key, { page = 1, limit = 20 }) {
  const skip = (Number(page) - 1) * Number(limit);
  const lim = Math.max(1, Math.min(500, Number(limit)));

  if (key === 'NameCompany') {
    // composite key: FirstName|LastName|CompanyName
    return [
      {
        $addFields: {
          __dupKey: {
            $concat: [
              { $ifNull: ['$FirstName', ''] }, '|',
              { $ifNull: ['$LastName', ''] }, '|',
              { $ifNull: ['$CompanyName', ''] }
            ]
          }
        }
      },
      { $match: { __dupKey: { $ne: '||' } } }, // ignore when all three are empty
      { $group: { _id: '$__dupKey', ids: { $push: '$_id' }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } },
      {
        $facet: {
          items: [{ $skip: skip }, { $limit: lim }],
          total: [{ $count: 'count' }]
        }
      }
    ];
  }

  // Simple field key (EmailID, DirectNumber, etc.)
  const field = key;
  return [
    { $match: { [field]: { $exists: true, $ne: null, $ne: '' } } },
    { $group: { _id: `$${field}`, ids: { $push: '$_id' }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
    { $sort: { count: -1 } },
    {
      $facet: {
        items: [{ $skip: skip }, { $limit: lim }],
        total: [{ $count: 'count' }]
      }
    }
  ];
}

// GET /api/duplicates/groups?key=EmailID|DirectNumber|NameCompany&page=1&limit=20
const listDuplicateGroups = async (req, res) => {
  const key = (req.query.key || 'EmailID').trim();
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);

  const pipeline = buildPipeline(key, { page, limit });
  const [agg] = await User.aggregate(pipeline);
  const items = (agg?.items || []).map(g => ({
    key,
    value: g._id,       // duplicate key value (or composite "First|Last|Company")
    count: g.count,
    ids: g.ids          // _ids in this group
  }));
  const total = agg?.total?.[0]?.count || 0;

  res.json({ key, items, total, page, pages: Math.ceil(total / limit) });
};

// GET /api/duplicates/items?key=...&value=...&page=1&limit=100
const listDuplicateItems = async (req, res) => {
  const key = (req.query.key || 'EmailID').trim();
  const value = String(req.query.value || '');
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 100);
  const skip = (page - 1) * limit;

  let match = {};
  if (key === 'NameCompany') {
    const [FirstName = '', LastName = '', CompanyName = ''] = value.split('|');
    match = { FirstName, LastName, CompanyName };
  } else {
    match = { [key]: value };
  }

  const [items, total] = await Promise.all([
    User.find(match).skip(skip).limit(limit).lean(),
    User.countDocuments(match)
  ]);

  res.json({ key, value, items, total, page, pages: Math.ceil(total / limit) });
};

module.exports = { listDuplicateGroups, listDuplicateItems };
