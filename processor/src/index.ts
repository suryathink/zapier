// processor is that guy who will pick tasks from transactional outbox and will those tasks into queue

import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";

const client = new PrismaClient();

const kafka = new Kafka({
  clientId: "outbox-processor",
  brokers: ["localhost:9092"],
});

// to create a topic in kafka, i did the below things, first ran the kafka

/*

surya@DL-IN-KA-000065:~$ docker exec -it cc50dad70a32 /bin/bash
cc50dad70a32:/$ cd /opt/kafka/
cc50dad70a32:/opt/kafka$ ./kafka-topics.sh --create --topic quickstart-events --bootstrap-server localhost:9092
bash: ./kafka-topics.sh: No such file or directory
cc50dad70a32:/opt/kafka$ ./kafka-topics.sh --create --topic zap-events--bootstrap-server localhost:9092
bash: ./kafka-topics.sh: No such file or directory
cc50dad70a32:/opt/kafka$ ./kafka-topics.sh --create --topic zap-events --bootstrap-server localhost:9092
bash: ./kafka-topics.sh: No such file or directory
cc50dad70a32:/opt/kafka$ find / -name kafka-topics.sh
find: /proc/tty/driver: Permission denied
find: /root: Permission denied
/opt/kafka/bin/kafka-topics.sh
cc50dad70a32:/opt/kafka$ cd /opt/kafka/bin
./kafka-topics.sh --create --topic zap-events --bootstrap-server localhost:9092
Created topic zap-events.


cc50dad70a32:/opt/kafka/bin$ ./kafka-console-consumer.sh --topic zap-events --from-beginning --bootstrap-server localhost:9092

*/
const TOPIC_NAME = "zap-events";
async function main() {
  const producer = kafka.producer();
  await producer.connect();

  while (true) {
    const pendingRows = await client.zapRunOutbox.findMany({
      where: {},
      take: 10,
    });

    await producer.send({
      topic: TOPIC_NAME,
      messages: pendingRows.map((r) => ({
        value: r.zapRunId,
      })),
    });

    // deletes from outbox collection once that thing is picked up by kafka queue
    await client.zapRunOutbox.deleteMany({
      where: {
        id: {
          in: pendingRows.map((x) => x.id),
        },
      },
    });
  }
}
main();
