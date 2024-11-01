import express from "express";
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

const app = express();

app.use(express.json());

app.post("/hooks/catch/:userId/:zapId", async (req, res) => {
  // here we must have that password logic, so that only verified users should hit this endpoint, ignore for now
  const userId = req.params.userId;
  const zapId = req.params.zapId;
  const body = req.body;

  //   store in db a new triger
  //   its a transaction
  await client.$transaction(async (tx) => {
    const run = await client.zapRun.create({
      data: {
        zapId,
        metadata: body,
      },
    });

    await client.zapRunOutbox.create({
      data: {
        zapRunId: run.id,
      },
    });
  });

  res.json({
    message: "webhook received",
  });

  // push it to a queue (kafka/redis)
  //   kafkaPublisher.publish({
  //     zapId
  //   })
});

app.listen(3000);
