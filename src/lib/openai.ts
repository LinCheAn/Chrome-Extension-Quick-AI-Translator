import OpenAI from 'openai';

export const translateTextStreamOpenAI = async (
    apiKey: string,
    modelName: string,
    prompt: string,
    text: string,
    onChunk: (chunk: string) => void
): Promise<string> => {
    if (!apiKey) {
        throw new Error('API Key is missing');
    }

    const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true, // Required for client-side usage
    });

    const fullPrompt = `${prompt}\n\n${text}`;

    try {
        const stream = await openai.chat.completions.create({
            model: modelName,
            messages: [{ role: 'user', content: fullPrompt }],
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
