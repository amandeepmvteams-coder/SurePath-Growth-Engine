import { Request, Response } from "express";
import { merchantScoreService } from "../services/merchant-score.service";

export const merchantScoreController = {
  async getByMerchantId(
    req: Request<{ id: string }>,
    res: Response
  ) {
    const { id } = req.params;

    const scores = await merchantScoreService.getByMerchantId(id);

    if (scores === null) {
      return res.status(404).json({
        message: "Merchant not found",
      });
    }

    return res.status(200).json(scores);
  },
};