import { buildSystemPrompt, buildUserMessage } from './prompt';

/**
 * Chrome built-in AI (Prompt API) — runs Gemini Nano on-device.
 * No API key and no network request; available to extensions from Chrome 138.
 * https://developer.chrome.com/docs/ai/prompt-api
 */

type ModelAvailability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

interface DownloadMonitor {
    addEventListener(type: 'downloadprogress', listener: (e: { loaded: number }) => void): void;
}

interface LanguageModelCreateOptions {
    initialPrompts?: { role: 'system' | 'user' | 'assistant'; content: string }[];
    monitor?: (m: DownloadMonitor) => void;
    signal?: AbortSignal;
}

interface LanguageModelSession {
    promptStreaming(input: string, options?: { signal?: AbortSignal }): ReadableStream<string>;
    destroy(): void;
}

interface LanguageModelStatic {
    availability(): Promise<ModelAvailability>;
    create(options?: LanguageModelCreateOptions): Promise<LanguageModelSession>;
}

export type LocalModelStatus = ModelAvailability | 'unsupported';

const getLanguageModel = (): LanguageModelStatic | undefined =>
    (globalThis as { LanguageModel?: LanguageModelStatic }).LanguageModel;

export const getLocalModelStatus = async (): Promise<LocalModelStatus> => {
    const LanguageModel = getLanguageModel();
    if (!LanguageModel) return 'unsupported';
    try {
        return await LanguageModel.availability();
    } catch {
        return 'unavailable';
    }
};

const createSession = async (
    systemPrompt: string,
    onDownloadProgress?: (fraction: number) => void
): Promise<LanguageModelSession> => {
    const LanguageModel = getLanguageModel();
    if (!LanguageModel) {
        throw new Error("Chrome's built-in Gemini Nano is not available in this browser (requires desktop Chrome 138+).");
    }

    const status = await getLocalModelStatus();
    if (status === 'unavailable') {
        throw new Error('This device does not meet the requirements for the on-device model. See chrome://on-device-internals.');
    }

    return LanguageModel.create({
        initialPrompts: systemPrompt.trim() ? [{ role: 'system', content: systemPrompt }] : undefined,
        // Only fires when the model still has to be downloaded.
        monitor: (m) => {
            m.addEventListener('downloadprogress', (e) => onDownloadProgress?.(e.loaded));
        },
    });
};

/** Downloads the model if needed. Must be called from a user gesture (click). */
export const downloadLocalModel = async (onDownloadProgress: (fraction: number) => void): Promise<void> => {
    const session = await createSession('', onDownloadProgress);
    session.destroy();
};

export const translateTextStreamLocal = async (
    prompt: string,
    text: string,
    onChunk: (fullText: string) => void,
    onDownloadProgress?: (fraction: number) => void
): Promise<string> => {
    const session = await createSession(buildSystemPrompt(prompt), onDownloadProgress);

    try {
        const reader = session.promptStreaming(buildUserMessage(text)).getReader();
        let fullText = '';

        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            fullText += value; // chunks are deltas
            onChunk(fullText);
        }

        return fullText;
    } catch (error) {
        console.error('Local translation error:', error);
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
            throw new Error('The text is too long for the on-device model. Try a shorter passage.');
        }
        throw error;
    } finally {
        session.destroy();
    }
};
