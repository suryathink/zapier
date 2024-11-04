import { Router } from "express";
import { authMiddleware } from "../middleware";
import { ZapCreateSchema } from "../types";
import { prismaClient } from "../db";

const router = Router();

router.post("/", authMiddleware, async (req, res) => {
  console.log("create a zap");
  // @ts-ignore
  const id = req.id;
  const body = req.body;
  const parsedData = ZapCreateSchema.safeParse(body);

  if (!parsedData.success) {
    res.status(411).json({
      message: "Incorrect inputs",
    });
    return;
  }

  await prismaClient.$transaction(async (tx) => {
    // Create the zap with associated actions
    const zap = await tx.zap.create({
      data: {
        userId: id,
        triggerId: "", // Assuming this will be set` later
        action: {
          create: parsedData.data.actions.map((x, index) => ({
            actionId: x.availableActionId,
            sortingOrder: index,
          })),
        },
      },
    });

    // Create the trigger with a link to the zap
    const trigger = await tx.trigger.create({
      data: {
        triggerId: parsedData.data.availableTriggerId,
        zapId: zap.id,
      },
    });

    // Update the zap with the created trigger's ID
    await tx.zap.update({
      where: {
        id: zap.id,
      },
      data: {
        triggerId: trigger.id,
      },
    });
  });

  res.json({
    message: "Zap created successfully",
  });
  return;
});

// get all zaps for a user
router.get("/", authMiddleware, async (req, res) => {
  console.log("zaps handler");
  // @suryathink
  // @ts-ignore
  const id = req.id;

  const zaps = await prismaClient.zap.findMany({
    where: {
      userId: id,
    },
    include: {
      action: {
        include: {
          type: true,
        },
      },
      trigger: {
        include: {
          type: true,
        },
      },
    },
  });

  res.json({
    zaps,
  });
  return;
});

router.get("/:zapId", authMiddleware, async (req, res) => {
  console.log("get specific zap information");
  // @suryathink
  // @ts-ignore
  const id = req.id;
  const zapId = req.params.zapId;

  const zap = await prismaClient.zap.findFirst({
    where: {
      id: zapId,
      userId: id,
    },
    include: {
      action: {
        include: {
          type: true,
        },
      },
      trigger: {
        include: {
          type: true,
        },
      },
    },
  });

  res.json({
    zap,
  });
  return;
});

export const zapRouter = router;
