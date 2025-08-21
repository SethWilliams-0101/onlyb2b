const express = require("express");
const { login, bootstrapUsers } = require("../controllers/authController");
const { activityLogger } = require("../middleware/activityLogger");
const { verifyJWT } = require("../middleware/auth");

const router = express.Router();
router.post("/login", activityLogger("LOGIN_ATTEMPT"), login);
router.post("/bootstrap", bootstrapUsers);
// new:
router.get("/me", verifyJWT, (req, res) => res.json({ user: req.user }));

module.exports = router;
