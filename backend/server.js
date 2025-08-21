// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

// routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const activityRoutes = require("./routes/activityRoutes");
const exportRoutes = require("./routes/exportRoutes");
const adminRoutes = require("./routes/adminRoutes");
const uploadReportRoutes = require("./routes/uploadReportRoutes");
const duplicateRoutes = require("./routes/duplicateRoutes");

const { activityLogger } = require("./middleware/activityLogger");

const app = express();

/** ---------- CORS (Render + Dev) ---------- */
const FRONTEND_ORIGIN = (process.env.FRONTEND_ORIGIN || "").split(",").map(s => s.trim()).filter(Boolean);

// In dev, allow localhost Vite ports
const DEV_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

const ALLOWLIST = new Set([ ...FRONTEND_ORIGIN, ...DEV_ORIGINS ]);

const corsOptions = {
  origin(origin, cb) {
    // allow curl/Postman (no Origin)
    if (!origin) return cb(null, true);
    if (ALLOWLIST.has(origin)) return cb(null, true);
    return cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: false,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Audit-Code"],
};

app.use(cors(corsOptions));
app.use(express.json());

// Behind a proxy on Render (correct IPs in req.ip)
app.set("trust proxy", 1);

// Connect DB
connectDB();

/** ---------- Routes ---------- */
app.use("/api/auth", authRoutes); // public (login + bootstrap)
app.use("/api/users", activityLogger("USERS_API"), userRoutes);
app.use("/api/activities", activityRoutes); // requires JWT + audit code in that router
app.use("/api/exports", exportRoutes);
app.use("/api/upload-reports", uploadReportRoutes);
app.use("/api/duplicates", duplicateRoutes);
app.use("/api/admin", adminRoutes); // stats for Admin Dashboard (JWT + audit code)

// add near your other routes
app.get("/", (_req, res) => {
  res.type("text/plain").send("OnlyB2B API is running. Try GET /health");
});

app.get("/health", (_req, res) => res.json({ ok: true }));

/** ---------- Socket.IO ---------- */
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (ALLOWLIST.has(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS (socket.io)"));
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization", "X-Audit-Code"],
  },
});

io.on("connection", () => {
  console.log("Client connected");
});

/** ---------- Start ---------- */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
