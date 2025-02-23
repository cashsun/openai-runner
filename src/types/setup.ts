import { ClientOptions } from 'openai';
import { ChatCompletionCreateParamsNonStreaming, FunctionDefinition } from 'openai/resources';

/** 
 * ActionResult can be used to signal step failure by including errorMessage or throw exception. 
 * Nevertheless your function can return anything or void
 * */
export interface ActionResult {
    errorMessage?: string;
}

export type CreateActions = (context: any) => Record<string, Action>;
export type PromptBuilder = (task: string, context: any) => string;

export type SetupOptions = ClientOptions & Pick<ChatCompletionCreateParamsNonStreaming, 'model'> & {
    /** defaults to 2000 */
    maxPromptLength?: number
};

export type Action = FunctionDefinition & {
    fn: (args: any) => ActionResult | any | void;
}