# openai-runner

A simple openai task runner driven by openai-like models' [Function Calling](https://platform.openai.com/docs/guides/function-calling) API.

You can use this tool to quickly write automated unit tests, E2E tests (e.g. Playwright) and much more.

Support Typescript out of box.

## Simple Use Case

```javascript
import { setup, SetupOptions,Action, CreateActions, Action } from 'openai-runner';

// demo config talking to local model llama 3.2
const options: SetupOptions = {
  model: "hermes-3-llama-3.2-3b",
  baseURL: "http://localhost:1234/v1/",
  apiKey: "",
};

/**
 * actions map providing function definition and actual function call
 * */
const createActions: CreateActions = (context: any) => {
    return {
        walk: {
            fn: ({ secs }: { secs: number }) => {
                console.log(
                    `Robot walked for ${secs} seconds in a ${context.weather} weather`
                );
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
        // more actions ...
    }
}

const buildPrompt = (task: string, context: { weather: string }) => `
    This is your task: ${task}.

    * use provided tools to finish the task.
    * Upon finishing the task, chat to user "Nice robot! And the weather is ${context.weather}" as the final message without saying anything else.
`;

const ai = setup(options, createActions, buildPrompt);

await ai('Ask the robot to walk for 2 minutes and sit for 1 hour.', {
    weather: "sunny",
});

```

```
 # expected output

Function:  walk
Params:  {"secs":120}
Robot walked for 120 seconds in a sunny weather (from console.log)
Call result:  [empty]

Function:  sit
Params:  {"secs":3600}
Robot sat for 3600 seconds in a sunny weather (from console.log)
Call result:  [empty]

Step finished. Final message from AI assistant:
Nice robot! The weather is sunny.

```

## Installation

### using npm

```shell
npm i openai-runner
```

### using pnpm

```shell
pnpm add openai-runner
```