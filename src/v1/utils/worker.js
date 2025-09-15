import { Worker } from "bullmq";
import { connection } from "./queue.js";
import { AIprompt } from "./aiPrompt.js";
import messageModel from "../models/messages.model.js";

const worker = new Worker(
    "GeminiRequestQueue",

    async function (job) {
        //get data from queue
        const { userPrompt, id } = job.data;
        console.log("Processing Job", job.name, job.data);

        //call Gemini for response
        const result = await AIprompt(userPrompt);

        //once result is recieved store it in DB
        await messageModel.create({
            message_id: `${result.resp_id}_A`,  // _A at the end stands for Assistant (this naming convention allows same message id for both user and assistant)
            role: "assistant",
            content: result.resp,
            chatroom_id: id
        });

        //if the prompt was valid and a valid response was recieved store the prompt sent by the user
        await messageModel.create({
            message_id: `${result.resp_id}_U`, // _U at the end stands for User
            role: "user",
            content: userPrompt,
            chatroom_id: id
        });
    },
    connection
);

worker.on("completed", (job, returnValue) => {
  console.log(`Job ${ job.name } completed`);
});

worker.on("failed", (job, error) => {
  console.error(`Job ${ job.name } failed:`, error);
});


