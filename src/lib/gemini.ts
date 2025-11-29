import { GoogleGenerativeAI } from '@google/generative-ai';

export const translateText = async (
    apiKey: string,
    modelName: string,
    prompt: string,
    text: string
): Promise<string> => {
    if (!apiKey) {
        throw new Error('API Key is missing');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const fullPrompt = `${prompt}\n\n${text}`;

    try {
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Translation error:', error);
        throw error;
    }
};

export const translateTextStream = async (
    apiKey: string,
    modelName: string,
    prompt: string,
    text: string,
    onChunk: (chunk: string) => void
): Promise<string> => {
    if (!apiKey) {
        throw new Error('API Key is missing');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const fullPrompt = `${prompt}\n\n${text}`;

    try {
        const result = await model.generateContentStream(fullPrompt);
        let fullText = '';

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullText += chunkText;
            onChunk(fullText);
        }

        return fullText;
    } catch (error) {
        console.error('Translation error:', error);
        throw error;
    }
};
