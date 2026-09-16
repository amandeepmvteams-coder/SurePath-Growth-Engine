import { Request, Response } from "express";
import { researchRunService } from "../services/research-run.service";

class ResearchController {
  async run(
    req: Request,
    res: Response
  ) {
    try {
      const result =
        await researchRunService.run(
          req.body
        );

      return res.status(200).json(result);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "MERCHANT_NOT_FOUND"
      ) {
        return res.status(404).json({
          message: "Merchant not found",
        });
      }

      if (
        error instanceof Error &&
        error.message ===
          "RESEARCH_INPUT_REQUIRED"
      ) {
        return res.status(422).json({
          detail: [
            {
              loc: ["body"],
              msg:
                "Provide merchant_id, merchant_ids, or limit",
              type: "value_error",
              input: req.body,
              ctx: {},
            },
          ],
        });
      }

      return res.status(500).json({
        message: "Research failed",
      });
    }
  }
}

export const researchController =
  new ResearchController();