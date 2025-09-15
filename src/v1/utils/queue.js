import { config } from "../../../config/config.js";
import { Queue } from "bullmq";

export const connection = {
    connection: {
        url: config.UPSTASH_URL
    }
};

export const GeminiRequestQueue = new Queue("GeminiRequestQueue", connection);
