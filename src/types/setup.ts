import { ClientOptions } from "openai";
import {
  ChatCompletionMessageParam,
  ChatCompletionCreateParamsNonStreaming,
  FunctionDefinition,
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
    systemRole?: ChatCompletionMessageParam;
  };

export type Action = FunctionDefinition & {
  /** args must be of one object */
  fn: (args?: object) => Promise<ActionResult | any | void> | ActionResult | any | void;
};
