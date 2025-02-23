import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import clc from "cli-color";
import { Action, SetupOptions } from "types/setup";

export const completeTasks = async (
  prompt: string,
  config: SetupOptions,
  actions: Record<string, Action>
) => {
  const openai = new OpenAI(config);
  const firstMessages: ChatCompletionMessageParam[] = [
    { role: "user", content: prompt },
  ];
  return handleMessage(firstMessages, actions, openai, config);
};

const handleMessage = async (
  messages: ChatCompletionMessageParam[],
  actions: Record<string, Action>,
  openai: OpenAI,
  options: SetupOptions
) => {
  const firstResponse = await openai.chat.completions.create({
    model: options.model,
    messages,
    tools: Object.values(actions).map(({ fn, ...rest }) => {
      return {
        type: "function",
        function: {
          ...rest,
        },
      };
    }),
  });
  const message = firstResponse.choices[0].message;

  // exit condition
  if (message.role === "assistant" && !message.tool_calls?.length) {
    console.log(
      clc.green("Step finished. Final message from AI assistant: \n "),
      message.content
    );
    return { message: message.content ?? "" };
  }

  //   manually calling all the recommended funcitons
  if (message.tool_calls?.length) {
    messages.push(message);
    for (const toolCall of message.tool_calls) {
      console.log(clc.blueBright("Function: "), toolCall.function.name);
      console.log(clc.blueBright("Params: "), toolCall.function.arguments);
      const fnResult = await actions[toolCall.function.name]?.fn(
        JSON.parse(toolCall.function.arguments)
      );
      console.log(clc.yellowBright("Call result: "), fnResult, "\n");
      if (fnResult?.errorMessage) {
        throw new Error(fnResult.errorMessage);
      }
      messages.push({
        tool_call_id: toolCall.id,
        role: "tool",
        content: JSON.stringify(fnResult ?? []),
      });
    }
  }

  return handleMessage(messages, actions, openai, options);
};
