import express from "express";
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

const app = express();

app.post("/hooks/catch/:userId/:zapId", async (req, res) => {
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

  // push it to a queue (kafka/redis)
  //   kafkaPublisher.publish({
  //     zapId
  //   })
});
