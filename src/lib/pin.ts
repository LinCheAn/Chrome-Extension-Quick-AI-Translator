/**
 * "Pin" support. A Chrome action popup always closes when it loses focus, and a normal
 * browser window can't be kept on top of the page. So pinning moves the UI into Chrome's
 * side panel, which stays docked beside the page while you click around it (e.g. while
 * waiting for a translation) and survives tab switches. Needs the "sidePanel" permission
 * and Chrome 116+; older Chrome falls back to a separate popup window.
 */

interface ChromeLike {
    runtime?: { getURL(path: string): string };
    sidePanel?: {
        setOptions(options: { path?: string; enabled?: boolean }): Promise<void>;
        open(options: { windowId: number }): Promise<void>;
    };
    windows?: {
        WINDOW_ID_CURRENT: number;
        create(data: { url: string; type: 'popup'; width: number; height: number; focused: boolean }): Promise<unknown>;
    };
}

const getChrome = (): ChromeLike | undefined => (globalThis as { chrome?: ChromeLike }).chrome;

const params = new URLSearchParams(window.location.search);

/** True when this page is running pinned (side panel, or the fallback window). */
export const isPinnedWindow = params.get('pinned') === '1';

/** True when it was pinned mid-translation and should restart it. */
export const shouldResumeTranslation = params.get('resume') === '1';

/** Pinning only makes sense inside the extension, not in `npm run dev`. */
export const canPin = (): boolean => !isPinnedWindow && !!(getChrome()?.sidePanel || getChrome()?.windows);

/**
 * Must run directly in the click handler: sidePanel.open() requires a user gesture,
 * so nothing may be awaited before it.
 */
export const openPinnedWindow = (resume: boolean): void => {
    const chrome = getChrome();
    if (!chrome) return;

    const path = `index.html?pinned=1${resume ? '&resume=1' : ''}`;

    if (chrome.sidePanel?.open && chrome.windows) {
        // Both calls are dispatched in order without awaiting, so open() keeps the gesture
        // and uses the path set just before it.
        chrome.sidePanel.setOptions({ path, enabled: true }).catch(console.error);
        chrome.sidePanel
            .open({ windowId: chrome.windows.WINDOW_ID_CURRENT })
            .then(() => window.close()) // close the action popup
            .catch((err) => console.error('Could not open side panel:', err));
        return;
    }

    // Fallback for Chrome < 116: a separate window (not kept on top, but survives focus loss).
    if (chrome.windows && chrome.runtime) {
        chrome.windows
            .create({ url: chrome.runtime.getURL(path), type: 'popup', width: 620, height: 680, focused: true })
            .then(() => window.close())
            .catch(console.error);
    }
};

/** After resuming, point the side panel back at the plain path so reopening it later doesn't re-translate. */
export const clearResumeFlag = (): void => {
    const url = new URL(window.location.href);
    url.searchParams.delete('resume');
    window.history.replaceState(null, '', url);
    getChrome()?.sidePanel?.setOptions({ path: 'index.html?pinned=1' }).catch(() => {});
};

/** Unpin: closing the document closes the side panel (or the fallback window). */
export const closePinnedWindow = (): void => window.close();
