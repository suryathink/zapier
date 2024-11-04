import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware";
import { SignupSchema, SignInSchema } from "../types";
import { prismaClient } from "../db";
import { JWT_PASSWORD } from "../config";

const router = Router();

router.post("/signup", async (req: Request, res: Response): Promise<void> => {
  const body = req.body;
  const parsedData = SignupSchema.safeParse(body);
  if (!parsedData.success) {
    res.status(411).json({
      message: "Incorrect inputs",
    });
    return;
  }

  const userExists = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data.username,
    },
  });

  if (userExists) {
    res.status(403).json({
      message: "User already exists",
    });
    return;
  }

  await prismaClient.user.create({
    data: {
      email: parsedData.data.username,
      password: parsedData.data.password,
      name: parsedData.data.name,
    },
  });
  // todo send email to verify  account
  res.json({
    message: "please verify your account by checking your email",
  });
  return;
});

router.post("/signin", async (req: Request, res: Response) => {
  const body = req.body;
  const parsedData = SignInSchema.safeParse(body);

  if (!parsedData.success) {
    res.status(411).json({
      message: "Incorrect inputs",
    });
    return;
  }

  const user = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data.username,
      password: parsedData.data.password,
    },
  });

  if (!user) {
    res.status(403).json({
      message: "Credentials are incorrect",
    });
    return;
  }
  // todo sign the jwt
  const token = jwt.sign(
    {
      id: user.id,
    },
    process.env.JWT_PASSWORD as string
  );

  res.json({
    token,
  });
  return;
});

router.get("/", authMiddleware, async (req: Request, res: Response) => {
  // TODO: Fix the type
  // @ts-ignore
  const id = req.id;
  const user = await prismaClient.user.findFirst({
    where: {
      id,
    },
    select: {
      name: true,
      email: true,
    },
  });

  res.json({
    user,
  });
  return;
});

export const userRouter = router;
