import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";

const model = new ChatOpenAI({
  model: "doubao-seed-1-6-251015",
  apiKey: "5ec58e80-28f4-4f15-a2ce-b077000841bd",
  configuration: { baseURL: "https://ark.cn-beijing.volces.com/api/v3" },
  temperature: 0,
  streaming: true,
});

export const agent = createAgent({
  model,
  tools: [],
});
