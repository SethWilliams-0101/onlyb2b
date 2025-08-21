const express = require("express");
const multer = require("multer");
const { getUsers, uploadCSV, exportUsers } = require("../controllers/userController");
const { verifyJWT } = require("../middleware/auth");
const { activityLogger } = require("../middleware/activityLogger");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// protect if you want these to require login:
router.get("/", verifyJWT, activityLogger("GET_USERS"), getUsers);
router.get("/export", verifyJWT, activityLogger("EXPORT_USERS"), exportUsers);
router.post("/upload", verifyJWT, activityLogger("UPLOAD_USERS"), upload.single("file"), uploadCSV);

module.exports = router;
