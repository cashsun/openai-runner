import { Action, CreateActions, SetupOptions } from "types/setup";
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
      return {result: 'done'}
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
  } as Action,
  sit: {
    fn: ({ secs }: { secs: number }) => {
      console.log(
        `Robot sat for ${secs} seconds`,
        context?.weather ? `in a ${context.weather} weather` : ""
      );
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
  } as Action,
});

const buildPrompt = (task: string, context: { weather: string }) => `
This is your task: ${task}.

* Upon finishing the task, chat to user "Nice robot! And the weather is ${context.weather}" as the final message without saying anything else.
`;

describe("Openai runner", () => {
  it("can perform simple robot commands", { timeout: 60_000 }, async () => {
    const ai = setup(options, createActions, buildPrompt);

    const result = await ai('Ask the robot to walk for 2 minutes and sit for 1 hour.', {
      weather: "sunny",
    });

    console.log('result.message :>> ', result);

    /**
     * expected output
     *
     * Function:  walk
     * Params:  {"secs":120}
     * Robot walked for 120 seconds in a sunny weather (from console.log)
     * Call result:  [empty] 
     * 
     * Function:  sit
     * Params:  {"secs":360}
     * Robot sat for [object Object] seconds in a sunny weather (from console.log)
     * Call result:  [empty] 
     * 
     * Step finished. Final message from AI assistant: 
     * Nice robot! The weather is sunny.
     * 
     */
  });
});
