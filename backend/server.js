import { validateEnv, env } from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";
import app from "./app.js";

const start = async () => {
  validateEnv();
  await connectDB();

  const server = app.listen(env.port, () => {
    console.log(`CivicFix API running on port ${env.port} (${process.env.NODE_ENV || "development"})`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

start().catch((error) => {
  console.error(`Failed to start the server: ${error.message}`);
  process.exit(1);
});
