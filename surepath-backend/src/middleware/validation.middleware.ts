import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const validate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const detail = errors.array().map((error: any) => ({
      loc: ["body", error.path],
      msg: error.msg,
      type: error.type || "field",
      input: error.value,
      ctx: {},
    }));

    return res.status(422).json({
      detail,
    });
  }

  next();
};