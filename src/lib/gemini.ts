import { GoogleGenerativeAI, type GenerationConfig } from '@google/generative-ai';
import { buildSystemPrompt, buildUserMessage } from './prompt';

/**
 * Thinking models (Gemini 2.5 / 3) reason before writing the first token, which makes
 * translations feel slow and adds nothing for this task. Keep thinking as low as each
 * model allows. (The SDK's types predate thinkingConfig, but it passes it through.)
 */
const thinkingConfigFor = (modelName: string): Record<string, unknown> | undefined => {
    const m = modelName.toLowerCase();
    if (/gemini-[3-9]/.test(m)) return { thinkingLevel: m.includes('pro') ? 'low' : 'minimal' };
    if (m.includes('gemini-2.5')) return { thinkingBudget: m.includes('pro') ? 128 : 0 }; // Pro can't fully disable
    return undefined; // older models don't think
};

const isThinkingConfigError = (error: unknown) =>
    error instanceof Error && /thinking/i.test(error.message);

/** Streams the raw model response; callers parse it with parseTranslation(). */
export const translateTextStream = async (
    apiKey: string,
    modelName: string,
    prompt: string,
    text: string,
    onChunk: (rawText: string) => void
): Promise<string> => {
    if (!apiKey) {
        throw new Error('API Key is missing');
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const run = async (thinkingConfig?: Record<string, unknown>) => {
        const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: buildSystemPrompt(prompt),
            generationConfig: (thinkingConfig ? { thinkingConfig } : {}) as GenerationConfig,
        });
        const result = await model.generateContentStream(buildUserMessage(text));
        let fullText = '';

        for await (const chunk of result.stream) {
            fullText += chunk.text();
            onChunk(fullText);
        }

        return fullText;
    };

    try {
        const thinkingConfig = thinkingConfigFor(modelName);
        try {
            return await run(thinkingConfig);
        } catch (error) {
            // A model that rejects this thinking setting: retry with the model's default.
            if (thinkingConfig && isThinkingConfigError(error)) return await run();
            throw error;
        }
    } catch (error) {
        console.error('Translation error:', error);
        throw error;
    }
};
