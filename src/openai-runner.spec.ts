import { CreateActions, SetupOptions } from "types/setup";
import { setup } from "./setup";
import { describe, it } from "vitest";

// example config talking to LM studio local model llama 3.2
const options: SetupOptions = {
  model: "hermes-3-llama-3.2-3b",
  baseURL: "http://localhost:1234/v1/",
  apiKey: "",
};

const createActions: CreateActions = (context: any) => ({
  walk: {
    fn: ({ secs }: { secs: number }) => {
      console.log(
        `Robot walked for ${secs} seconds`,
        context?.weather ? `in a ${context.weather} weather` : ""
      );
      return {};
    },
    name: "walk",
    description: "instruct robot to walk for given seconds",
    parameters: {
      type: "object",
      properties: {
        secs: {
          type: "number",
          description: "number of seconds the robot should walk",
        },
      },
    },
  },
  sit: {
    fn: ({ secs }: { secs: number }) => {
      console.log(
        `Robot sat for ${secs} seconds`,
        context?.weather ? `in a ${context.weather} weather` : ""
      );
      return {};
    },
    name: "sit",
    description: "instruct robot to sit for given seconds",
    parameters: {
      type: "object",
      properties: {
        secs: {
          type: "number",
          description: "number of seconds the robot should sit",
        },
      },
    },
  },
});

describe("Openai runner", () => {
  it("can perform simple robot commands", { timeout: 60_000 }, async () => {
    const buildPrompt = (task: string) => `
        this is your task: ${task}.
        * in your final message, say "Nice robot!"
    `;
    const ai = setup(options, createActions, buildPrompt);

    await ai("ask the robot to walk for 2 minutes and sit for 1 hour", {
      weather: "sunny",
    });
  });
});
