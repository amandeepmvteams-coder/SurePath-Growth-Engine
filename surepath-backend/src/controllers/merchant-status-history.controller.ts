import { Request, Response } from "express";
import { merchantStatusHistoryService } from "../services/merchant-status-history.service";

class MerchantStatusHistoryController {
  async getByMerchantId(
    req: Request<{ merchant_id: string }>,
    res: Response
  ) {
    const { merchant_id } = req.params;

    const history =
      await merchantStatusHistoryService.getByMerchantId(
        merchant_id
      );

    res.status(200).json(history);
  }
}

export const merchantStatusHistoryController =
  new MerchantStatusHistoryController();