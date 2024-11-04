import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "./config";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization as unknown as string;
  try {
    const payload = jwt.verify(token.split(" ")[1], process.env.JWT_PASSWORD!);
    // @ts-ignore
    req.id = payload.id;
    next();
  } catch (error) {
    res.status(403).json({
      message: "you are not logged in",
    });
    return;
  }
}
