import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import merchantRoutes from "./routes/merchant.routes";
import merchantStatusHistoryRoutes from "./routes/merchant-status-history.routes";
import taskRoutes from "./routes/task.routes";
import scoringConfigRoutes from "./routes/scoring-config.routes";
import scoringRoutes from "./routes/scoring.routes";
import researchRoutes from "./routes/research.routes";
import profileRunRoutes from "./routes/profile-run.routes";
import detectionRunRoutes from "./routes/detection-run.routes";
import discoveryRoutes from "./routes/discovery.routes";
import industryRoutes from "./routes/industry.routes";
import aiConfigRoutes from "./routes/ai.routes";

const app = express();

app.use(cors());
app.use(express.json());


app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/merchants", merchantRoutes);
app.use("/api/v1/merchants", merchantStatusHistoryRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/scoring", scoringConfigRoutes);
app.use("/api/v1/scoring", scoringRoutes);
app.use("/api/v1/research", researchRoutes);
app.use("/api/v1/profiles", profileRunRoutes);
app.use("/api/v1/detections", detectionRunRoutes);
app.use("/api/v1/discovery", discoveryRoutes);
app.use("/api/v1/industries", industryRoutes);
app.use("/api/v1/ai", aiConfigRoutes);

app.get("/", (_req, res) => {
  res.json({
    message: "SurePath API is running",
  });
});

export default app;