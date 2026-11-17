import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildSystemPrompt, buildUserMessage } from './prompt';

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
    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: buildSystemPrompt(prompt),
    });

    try {
        const result = await model.generateContentStream(buildUserMessage(text));
        let fullText = '';

        for await (const chunk of result.stream) {
            fullText += chunk.text();
            onChunk(fullText);
        }

        return fullText;
    } catch (error) {
        console.error('Translation error:', error);
        throw error;
    }
};
