import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware";
import { SignupSchema } from "../types";
import { prismaClient } from "../db";

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

router.post("/signin", (req, res) => {
  console.log("signin handler");
});
router.get("/user", authMiddleware, (req, res) => {
  console.log("signin handler");
});

export const userRouter = router;
