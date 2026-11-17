import OpenAI from 'openai';
import { buildSystemPrompt, buildUserMessage } from './prompt';

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

    try {
        const stream = await openai.chat.completions.create({
            model: modelName,
            messages: [
                { role: 'system', content: buildSystemPrompt(prompt) },
                { role: 'user', content: buildUserMessage(text) },
            ],
            stream: true,
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
    } catch (error) {
        console.error('OpenAI Translation error:', error);
        throw error;
    }
};
