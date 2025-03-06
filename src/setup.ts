import { CreateActions, PromptBuilder, SetupOptions } from "types/setup";
import { completeTasks } from "./completeTasks";

/**
 * Setup your openai model
 * @param config Openai related options
 * @param createActions function to return actions map
 * @param buildPrompt function to generate the prompt
 * @returns function that accepts your task string & action context
 */
export const setup = (
  config: SetupOptions,
  createActions: CreateActions,
  buildPrompt: PromptBuilder
) => {
  return  async (task: string, context?: any) => {
    const prompt = await buildPrompt(task, context);
    const maxPromptLength = config.maxPromptLength ?? 2000;
    if (prompt.length > maxPromptLength) {
      throw new Error(`Prompt character length cannot exceed ${maxPromptLength}. Update your setup config to increase the limit.`);
    }
    const actions = createActions(context);
    return completeTasks(prompt, config, actions);
  };
};