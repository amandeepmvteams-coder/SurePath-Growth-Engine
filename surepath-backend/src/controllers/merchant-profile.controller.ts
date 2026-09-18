import { Request, Response } from "express";
import { merchantProfileService } from "../services/merchant-profile.service";
import { UpdateMerchantProfileData } from "../types/merchant-profile.types";

class MerchantProfileController {
  async getByMerchantId(
    req: Request<{ id: string }>,
    res: Response
  ) {
    const { id } = req.params;

    const profile =
      await merchantProfileService.getByMerchantId(id);

    if (!profile) {
      return res.status(200).json(null);
    }

    return res.status(200).json(profile);
  }

  async update(
    req: Request<
      { id: string },
      {},
      UpdateMerchantProfileData
    >,
    res: Response
  ) {
    const { id } = req.params;

    const profile =
      await merchantProfileService.updateByMerchantId(
        id,
        req.body
      );

    if (!profile) {
      return res.status(404).json({
        message: "Merchant profile not found",
      });
    }

    return res.status(200).json(profile);
  }
}

export const merchantProfileController =
  new MerchantProfileController();