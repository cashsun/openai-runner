import { ClientOptions } from 'openai';
import { ChatCompletionCreateParamsNonStreaming, FunctionDefinition } from 'openai/resources';

/** ActionResult can be used to signal step failure. 
 * Nevertheless your function should always at least return an empty object
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
    fn: (args: any) => ActionResult;
}