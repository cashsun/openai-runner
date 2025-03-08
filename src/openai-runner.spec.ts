import { CreateActions, SetupOptions } from "types/setup";
import { setup } from "./setup";
import { describe, it } from "vitest";
import { z } from "zod";

// example config talking to LM studio local model
const options: SetupOptions = {
  model: "hermes-3-llama-3.1-8b",
  baseURL: "http://office-pc:1234/v1/",
  apiKey: "",
};

const createActions: CreateActions = (context: any) => ({
  walk: {
    fn: async ({ secs }: { secs: number }) => {
      console.log(
        `Robot walked for ${secs} seconds`,
        context?.weather ? `in a ${context.weather} weather` : ""
      );
      return { result: "done" };
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
    },
    name: "sit",
    // pre validate suggested args by AI to fail fast
    parse: (args: string) => {
      return z
        .object({
          secs: z.number(),
        })
        .parse(JSON.parse(args));
    },
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

const buildPrompt = async (task: string, context: { weather: string }) => `
This is your task: ${task}.

* Upon finishing the task, respond to user "Nice robot! And the weather is ${context.weather}" as 
the final message.
`;

describe("Openai runner", () => {
  it("can perform simple robot commands", { timeout: 60_000 }, async () => {
    const ai = setup(options, createActions, buildPrompt);

    const result = await ai(
      "Ask the robot to walk for 2 minutes and sit for 1 hour.",
      {
        weather: "sunny",
      }
    );

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
     *
     *
     *   $$$ Token Usage
     *   ┌───────────────────┬────────┐
     *   │ (index)           │ Values │
     *   ├───────────────────┼────────┤
     *   │ prompt_tokens     │ 79     │
     *   │ completion_tokens │ 157    │
     *   │ total_tokens      │ 236    │
     *   └───────────────────┴────────┘
     */
  });

  it(
    "can operate normally when no actions provided",
    { timeout: 60_000 },
    async () => {
      const ai = setup(
        {
          ...options,
          systemPrompt:
            "You are a code generator. Only output code block without extra info.",
        },
        undefined,
        (task) => task
      );

      await ai(
        "Write a dummy js code to instruct a robot to walk for 5 mins.",
        { weather: "rainy" }
      );
    }

    /**
     * expected output
     *
     * 
       ```javascript
        function startRobotWalk() {
          console.log("Starting the robot's walking routine...");
          
          let walkingDuration = 300000; // Duration in milliseconds (5 minutes)
          setTimeout(endWalkingRoutine, walkingDuration);
        }

        function endWalkingRoutine() {
          console.log("The robot has finished its 5-minute walk.");
        }

        startRobotWalk();
      ```
     * 
     */
  );
});
