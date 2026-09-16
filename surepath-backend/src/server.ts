import dotenv from "dotenv";
import app from "./app";
import "./config/database";

import { bootstrapService } from "./services/bootstrap.service";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await bootstrapService.createInitialAccount();

    app.listen(PORT, () => {
      console.log(
        `SurePath backend running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Failed to start SurePath backend:",
      error
    );

    process.exit(1);
  }
};

startServer();