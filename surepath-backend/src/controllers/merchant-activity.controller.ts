import { Request, Response } from "express";

import { merchantActivityService } from "../services/merchant-activity.service";

import { CreateMerchantActivityData } from "../types/merchant-activity.types";

class MerchantActivityController {

  async getByMerchantId(
    req: Request<
      { id: string },
      {},
      {},
      { outreach_only?: string }
    >,
    res: Response
  ) {
    const { id } = req.params;

    const outreachOnly =
      req.query.outreach_only === "true";

    const activities =
      await merchantActivityService.getByMerchantId(
        id,
        outreachOnly
      );

    if (activities === null) {
      return res
        .status(404)
        .json({
          message: "Merchant not found",
        });
    }

    return res
      .status(200)
      .json(activities);
  }


  async create(
    req: Request<
      { id: string },
      {},
      {
        activity_type: string;
        direction?: string;
        channel?: string;
        subject?: string;
        body?: string;
        detail?: Record<string, unknown>;
        occurred_at: string;
        logged_by?: string;
      }
    >,
    res: Response
  ) {
    const { id } = req.params;

    try {

      const data: CreateMerchantActivityData = {
        activity_type: req.body.activity_type,
        direction: req.body.direction,
        channel: req.body.channel,
        subject: req.body.subject,
        body: req.body.body,
        detail: req.body.detail,
        occurred_at: new Date(req.body.occurred_at),
        logged_by: req.user?.id,
      };

      const activity =
        await merchantActivityService.create(
          id,
          data
        );

      if (activity === null) {
        return res
          .status(404)
          .json({
            message: "Merchant not found",
          });
      }

      return res
        .status(201)
        .json(activity);

    } catch (error) {

      if (!(error instanceof Error)) {
        throw error;
      }

      switch (error.message) {

        case "ACTIVITY_TYPE_REQUIRED":
          return res
            .status(400)
            .json({
              message: "Activity type is required",
            });

        case "INVALID_ACTIVITY_TYPE":
          return res
            .status(400)
            .json({
              message:
                "Invalid activity type. Allowed types are Call, Email, Meeting, and Outreach.",
            });

        case "ACTIVITY_SUBJECT_OR_BODY_REQUIRED":
          return res
            .status(400)
            .json({
              message:
                "Activity must contain a subject or body.",
            });

        case "OCCURRED_AT_REQUIRED":
          return res
            .status(400)
            .json({
              message:
                "Occurred at is required.",
            });

        case "INVALID_OCCURRED_AT":
          return res
            .status(400)
            .json({
              message:
                "Occurred at must be a valid timestamp.",
            });

        case "FUTURE_OCCURRED_AT":
          return res
            .status(400)
            .json({
              message:
                "Occurred at cannot be in the future.",
            });

        default:
          throw error;
      }
    }
  }
}

export const merchantActivityController =
  new MerchantActivityController();