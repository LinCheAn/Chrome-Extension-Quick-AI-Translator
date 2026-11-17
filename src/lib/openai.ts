import OpenAI from 'openai';
import type { ReasoningEffort } from 'openai/resources/shared';
import { buildSystemPrompt, buildUserMessage } from './prompt';

/**
 * Reasoning models (o-series, GPT-5) think before the first token; translation doesn't
 * need it, so use the lowest effort each family accepts. Other models get no parameter.
 */
const reasoningEffortFor = (modelName: string): ReasoningEffort | undefined => {
    const m = modelName.toLowerCase();
    if (m.includes('chat')) return undefined; // gpt-5-chat-latest etc. aren't reasoning models
    if (/^gpt-5\.\d/.test(m)) return 'none'; // GPT-5.1+
    if (/^gpt-5/.test(m)) return 'minimal';
    if (/^o\d/.test(m)) return 'low';
    return undefined;
};

const isReasoningParamError = (error: unknown) =>
    error instanceof OpenAI.APIError && error.status === 400 && /reasoning/i.test(error.message);

export const translateTextStreamOpenAI = async (
    apiKey: string,
    modelName: string,
    prompt: string,
    text: string,
    onChunk: (rawText: string) => void
): Promise<string> => {
    if (!apiKey) {
        throw new Error('API Key is missing');
    }

    const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true, // Required for client-side usage
    });

    const run = async (reasoningEffort?: ReasoningEffort) => {
        const stream = await openai.chat.completions.create({
            model: modelName,
            messages: [
                { role: 'system', content: buildSystemPrompt(prompt) },
                { role: 'user', content: buildUserMessage(text) },
            ],
            stream: true,
            ...(reasoningEffort ? { reasoning_effort: reasoningEffort } : {}),
        });

        let fullText = '';

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                fullText += content;
                onChunk(fullText);
            }
        }

        return fullText;
    };

    try {
        const effort = reasoningEffortFor(modelName);
        try {
            return await run(effort);
        } catch (error) {
            // Model rejects this effort level: retry with its default.
            if (effort && isReasoningParamError(error)) return await run();
            throw error;
        }
    } catch (error) {
        console.error('OpenAI Translation error:', error);
        throw error;
    }
};
