import { ClientOptions } from "openai";
import {
  ChatCompletionCreateParamsNonStreaming,
  FunctionDefinition,
  ChatCompletionSystemMessageParam,
} from "openai/resources";

/**
 * ActionResult can be used to signal step failure by including errorMessage or throw exception.
 * Nevertheless your function can return anything or void
 * */
export interface ActionResult {
  errorMessage?: string;
}

export type CreateActions = (context: any) => Record<string, Action>;
export type PromptBuilder = (task: string, context: any) => Promise<string> | string;

export type SetupOptions = ClientOptions &
  Pick<ChatCompletionCreateParamsNonStreaming, "model"> & {
    /** defaults to 2000 */
    maxPromptLength?: number;
    /** append system role message to have better control */
    systemRole?: ChatCompletionSystemMessageParam;
  };

export type Action = FunctionDefinition & {
  /** args must be of one object */
  fn: (args?: any) => Promise<ActionResult | any | void> | ActionResult | any | void;
};
