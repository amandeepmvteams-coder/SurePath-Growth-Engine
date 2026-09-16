import { Request, Response } from "express";
import { scoringConfigService } from "../services/scoring-config.service";
import { UpdateScoringConfigData } from "../types/scoring-config.types";

export const scoringConfigController = {
  async getCurrentConfig(
    req: Request,
    res: Response
  ) {
    const config =
      await scoringConfigService.getCurrentConfig();

    if (!config) {
      return res.status(404).json({
        message: "Scoring configuration not found",
      });
    }

    return res.status(200).json(config);
  },

  async getConfigHistory(
    req: Request,
    res: Response
  ) {
    const configs =
      await scoringConfigService.getConfigHistory();

    return res.status(200).json(configs);
  },

  async updateConfig(
    req: Request<
      {},
      {},
      UpdateScoringConfigData
    >,
    res: Response
  ) {
    try {
      const config =
        await scoringConfigService.updateConfig(
          req.body
        );

      return res.status(200).json(config);
    } catch (error) {
      console.error(
        "Failed to update scoring config:",
        error
      );

      return res.status(500).json({
        message: "Failed to update scoring configuration",
      });
    }
  },
};