import mongoose from "mongoose";

mongoose.set("strictQuery", true);

let listenersAttached = false;
let connecting = null;

const attachListeners = () => {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on("error", (error) => console.error(`MongoDB error: ${error.message}`));
  mongoose.connection.on("disconnected", () => console.warn("MongoDB disconnected."));
  mongoose.connection.on("reconnected", () => console.log("MongoDB reconnected."));
};

// Connects once. Calling it again (seed script, `node --watch` restarts, tests)
// reuses the open connection instead of creating another one.
export const connectDB = async () => {
  attachListeners();

  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connecting) return connecting;

  connecting = mongoose
    .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 })
    .then(({ connection }) => {
      console.log(`MongoDB connected: ${connection.host}/${connection.name}`);

      // With no database name in MONGO_URI, MongoDB silently uses "test".
      if (connection.name === "test") {
        console.warn(
          'MongoDB is using the default "test" database. If CivicFix should have its own ' +
            'database, add it to MONGO_URI (e.g. ...mongodb.net/civicfix?retryWrites=true).'
        );
      }

      return connection;
    })
    .catch((error) => {
      // Clear the pending promise so a later call can retry; server.js decides what to do.
      throw new Error(`Could not connect to MongoDB (${error.message})`);
    })
    .finally(() => {
      connecting = null;
    });

  return connecting;
};

export const disconnectDB = () => mongoose.disconnect();

// readyState 1 = connected
export const isDBConnected = () => mongoose.connection.readyState === 1;
