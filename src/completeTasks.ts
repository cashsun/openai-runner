import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import clc from "cli-color";
import { Action, SetupOptions } from "types/setup";
import { isEmpty, pick } from "lodash-es";

export const completeTasks = async (
  prompt: string,
  config: SetupOptions,
  actions: Record<string, Action> | undefined
) => {
  const openai = new OpenAI(config);
  const firstMessages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        config.systemPrompt ??
        "You are an automation tool focusing on finishing user speficied tasks using tools & functions, if provided. ",
    },
    { role: "user", content: prompt },
  ];
  return handleMessage(firstMessages, actions, openai, config);
};

const handleMessage = async (
  messages: ChatCompletionMessageParam[],
  actions: Record<string, Action> | undefined,
  openai: OpenAI,
  options: SetupOptions
) => {
  const hasActions = !isEmpty(actions);
  const firstResponse = await openai.chat.completions.create({
    model: options.model,
    messages,
    tools: hasActions
      ? Object.values(actions).map(({ fn, ...rest }) => {
          return {
            type: "function",
            function: {
              ...rest,
            },
          };
        })
      : undefined,
  });
  const message = firstResponse.choices[0].message;

  // exit condition
  if (
    message.role === "assistant" &&
    (!message.tool_calls?.length || !hasActions)
  ) {
    console.log(
      clc.xterm(8)("Step finished. Final message from AI assistant: \n "),
      clc.greenBright(message.content ?? "[empty]")
    );
    console.log(`\n\n${clc.yellowBright("$$$ Token Usage")}`);
    console.table(
      pick(
        firstResponse.usage,
        "prompt_tokens",
        "completion_tokens",
        "total_tokens"
      )
    );
    return { message: message.content ?? "" };
  }

  //   manually calling all the recommended funcitons
  if (message.tool_calls?.length && hasActions) {
    messages.push(message);
    for (const toolCall of message.tool_calls) {
      console.log(
        clc.xterm(8)("Function: "),
        clc.greenBright(toolCall.function.name)
      );
      console.log(
        clc.xterm(8)("Params: "),
        clc.greenBright(toolCall.function.arguments)
      );
      const fnResult = await actions[toolCall.function.name]?.fn(
        JSON.parse(toolCall.function.arguments)
      );
      console.log(
        clc.xterm(8)("Call result: "),
        clc.yellowBright(fnResult ? JSON.stringify(fnResult) : "[empty]"),
        "\n"
      );
      if (fnResult?.errorMessage) {
        throw new Error(fnResult.errorMessage);
      }
      messages.push({
        tool_call_id: toolCall.id,
        role: "tool",
        content: JSON.stringify(fnResult ?? {}),
      });
    }
  }

  return handleMessage(messages, actions, openai, options);
};
