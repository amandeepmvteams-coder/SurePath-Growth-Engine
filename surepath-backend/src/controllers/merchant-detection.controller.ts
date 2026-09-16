import { Request, Response } from "express";
import { merchantDetectionService } from "../services/merchant-detection.service";
import {
  CreateMerchantDetectionData,
  UpdateMerchantDetectionData,
} from "../types/merchant-detection.types";

export const merchantDetectionController = {
  async getByMerchantId(
    req: Request<{ id: string }>,
    res: Response
  ) {
    const { id } = req.params;

    const detections =
      await merchantDetectionService.getByMerchantId(id);

    if (detections === null) {
      return res.status(404).json({
        message: "Merchant not found",
      });
    }

    return res.status(200).json(detections);
  },

  async create(
    req: Request<
      { id: string },
      {},
      {
        provider_name: string;
        is_detected: boolean;
        confidence?: number;
        evidence?: Record<string, unknown>;
        source?: string;
        overridden_by?: string;
        override_reason?: string;
      }
    >,
    res: Response
  ) {
    const { id } = req.params;

    try {
      const data: CreateMerchantDetectionData = {
        provider_name: req.body.provider_name,
        is_detected: req.body.is_detected,
        confidence: req.body.confidence,
        evidence: req.body.evidence,
        source: req.body.source,
        overridden_by: req.user?.id,
        override_reason: req.body.override_reason,
      };

      const detection =
        await merchantDetectionService.create(id, data);

      if (detection === null) {
        return res.status(404).json({
          message: "Merchant not found",
        });
      }

      return res.status(201).json(detection);
    } catch (error) {
      if (!(error instanceof Error)) throw error;

      switch (error.message) {
        case "PROVIDER_NAME_REQUIRED":
          return res.status(400).json({
            message: "Provider name is required",
          });

        case "INVALID_CONFIDENCE":
          return res.status(400).json({
            message: "Confidence must be between 0 and 1",
          });

        default:
          throw error;
      }
    }
  },

  async update(
    req: Request<
      { id: string; detection_id: string },
      {},
      {
        provider_name?: string;
        is_detected?: boolean;
        confidence?: number | null;
        evidence?: Record<string, unknown> | null;
        override_reason?: string;
      }
    >,
    res: Response
  ) {
    const { detection_id } = req.params;

    try {
      const data: UpdateMerchantDetectionData = {
        provider_name: req.body.provider_name,
        is_detected: req.body.is_detected,
        confidence: req.body.confidence,
        evidence: req.body.evidence,
        override_reason: req.body.override_reason,
      };

      const detection =
        await merchantDetectionService.update(
          detection_id,
          data
        );

      if (detection === null) {
        return res.status(404).json({
          message: "Detection not found",
        });
      }

      return res.status(200).json(detection);
    } catch (error) {
      if (!(error instanceof Error)) throw error;

      switch (error.message) {
        case "PROVIDER_NAME_REQUIRED":
          return res.status(400).json({
            message: "Provider name is required",
          });

        case "INVALID_CONFIDENCE":
          return res.status(400).json({
            message: "Confidence must be between 0 and 1",
          });

        default:
          throw error;
      }
    }
  },
};