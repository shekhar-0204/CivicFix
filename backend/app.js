import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import { isDBConnected } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import ApiError from "./utils/ApiError.js";

const app = express();

// Needed so rate limiting sees the real client IP behind a proxy (Render, Railway, etc.)
if (env.isProduction) app.set("trust proxy", 1);

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      // No Origin header = curl, Postman, server-to-server.
      if (!origin || env.clientOrigins.includes(origin)) return callback(null, true);
      callback(ApiError.forbidden("This origin is not allowed by CORS."));
    },
  })
);

app.use(express.json({ limit: "100kb" }));

// Health check: reports 503 while MongoDB is unreachable.
app.get("/api/health", (_req, res) => {
  const database = isDBConnected() ? "connected" : "disconnected";

  res.status(database === "connected" ? 200 : 503).json({
    success: database === "connected",
    status: database === "connected" ? "ok" : "degraded",
    service: "civicfix-api",
    database,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
