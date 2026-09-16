import { scoringConfigRepository } from "../repositories/scoring-config.repository";
import { UpdateScoringConfigData } from "../types/scoring-config.types";

class ScoringConfigService {
  async getCurrentConfig() {
    return scoringConfigRepository.findActive();
  }

  async getConfigHistory() {
    return scoringConfigRepository.findAll();
  }

  async updateConfig(data: UpdateScoringConfigData) {
    const configs = await scoringConfigRepository.findAll();

    const latestVersion =
      configs.length > 0
        ? Math.max(...configs.map((config) => config.version))
        : 0;

    const nextVersion = latestVersion + 1;

    return scoringConfigRepository.create(
      data,
      nextVersion
    );
  }
}

export const scoringConfigService =
  new ScoringConfigService();