import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "outbox-processor",
  brokers: ["localhost:9092"],
});
const TOPIC_NAME = "zap-events";

async function main() {
  const consumer = kafka.consumer({
    groupId: "main-worker",
  });
  await consumer.connect();

  await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true });

  await consumer.run({
    /*
 what does autoCommit does, 
 by default auto complete is true, 

 whenevr you run kafka js, it auto commits,

 it means I am done, I have received the message, I have acknowleged it,
 move on to the next offset.

 if you set auto commit to false,is now when you have to manually tell the kafka consumer
 or the kafka cluster that hey I am done with the processing, I have done with the expensive operation
  and give some acknowledgement to the kafka instance. 
  
  how to do that ?

     await consumer.commitOffsets([
        {
          topic: TOPIC_NAME,
          partition: partition,
          offset: message.offset,
        },
      ]);

      you have to tell the kafka that for this topic-> TOPIC_NAME,
      and for this partition , this is the offset that has been done.

       and this +1 is from where you have to start from now
    
       so if offset number 5 is processed, whenever you are commiting an offset,
       you have to give +1 that is from 6 you start now.


       so if your message number 5 is processed then you tell kafka that start processing from the 6th offset





  */
    autoCommit: false,

    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        partition,
        offset: message.offset,
        value: message.value?.toString(),
      });

      await new Promise((r) => setTimeout(r, 1000));

      await consumer.commitOffsets([
        {
          topic: TOPIC_NAME,
          partition: partition,
          offset: message.offset + 1,
        },
      ]);
    },
  });
}

main();
