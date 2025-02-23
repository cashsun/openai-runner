import { CreateActions, PromptBuilder, SetupOptions } from "types/setup";
import { completeTasks } from "./completeTasks";

export const setup = (
  config: SetupOptions,
  createActions: CreateActions,
  buildPrompt: PromptBuilder
) => {
  return  async (task: string, context?: any) => {
    const prompt = buildPrompt(task, context);
    const maxPromptLength = config.maxPromptLength ?? 2000;
    if (prompt.length > maxPromptLength) {
      throw new Error(`Prompt length cannot exceed ${maxPromptLength}`);
    }
    const actions = createActions(context);
    await completeTasks(prompt, config, actions);
  };
};