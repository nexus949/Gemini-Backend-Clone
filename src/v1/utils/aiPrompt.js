import { config } from "../../../config/config.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

export async function AIprompt(userPrompt) {
    try {
        let assistant = await model.generateContent({
            contents: [
                {
                    role: 'model',
                    parts: [
                        { text: "Keep the response short" }
                    ]
                },
                {
                    role: "user",
                    parts: [{ text: userPrompt }]
                }
            ]
        });

        if (!assistant)
            return { resp: "" };

        let assistant_resp_id = assistant.response.responseId;
        let assistant_resp = assistant.response.candidates[0].content.parts[0].text;
        return {
            resp: assistant_resp,
            resp_id: assistant_resp_id
        };
    }
    catch (error) {
        console.log("Error getting response from Gemini: ", error);
        return { resp: "" };
    }
}
