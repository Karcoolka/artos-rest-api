import express from "express";
import apiV1Routes from "./routes/api.v1.routes.js";
import { errorHandler } from "./middleware/error-handler.js";

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get("/", (_req, res) => {
    res.json({ name: "artos-rest-api", status: "ok" });
  });

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/v1", apiV1Routes);

  app.use(errorHandler);

  return app;
}
