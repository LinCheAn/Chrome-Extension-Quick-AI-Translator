# Chrome Extension: Quick AI Translator
- (Just a test project for gemini 3 agent)
- A powerful, standalone Chrome Extension for quick text translation using **Google Gemini** or **OpenAI**. Designed for reading papers, articles, and quick snippets with a focus on speed and privacy.


## ✨ Features

-   **On-Device Translation**: Use Chrome's built-in **Gemini Nano** (Prompt API) — no API key, nothing leaves your browser. Requires desktop Chrome 138+ and a [supported device](https://developer.chrome.com/docs/ai/prompt-api).
-   **Multi-Provider Support**: Or use the **Google Gemini** API (Free tier available) or **OpenAI** (GPT-4o, etc.).
-   **Streaming Translation**: See results instantly word-by-word as they are generated.
-   **Custom Models**: Select from presets or type **ANY** model name (e.g., `gemini-2.5-flash`, `gpt-4.1-mini`).
-   **Smart History**: Automatically saves your last 10 translations. Click any history item to restore it.
-   **Privacy First**: Your API keys and history are stored **locally** in your browser. No external servers involved.
-   **Clean UI**: Three low-saturation color themes (Mist Blue, Sage Green, Dusty Rose) with automatic dark mode, clear button, and one-click copy.

## 🚀 Quick Start (Installation)

### Option 1: Install from Zip (Easiest)
1.  Download the **`ai-translator-extension.zip`** file from this repository.
2.  Unzip the file. You will see a folder named `dist`.
3.  Open Google Chrome and navigate to `chrome://extensions`.
4.  Toggle **Developer mode** in the top right corner.
5.  Click **Load unpacked**.
6.  Select the `dist` folder you just unzipped.
7.  The extension is now installed! Pin it to your toolbar for easy access.

### Option 2: Build from Source
If you want to modify the code or build it yourself:

1.  Clone the repository:
    ```bash
    git clone https://github.com/LinCheAn/Chrome-Extension-Quick-AI-Translator.git
    cd Chrome-Extension-Quick-AI-Translator
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Build the extension:
    ```bash
    npm run build
    ```
4.  Load the `dist` folder into Chrome (follow steps 3-6 from Option 1).

## 📖 Usage

1.  **Set API Key**:
    -   Click the **Settings** (gear icon) in the top right.
    -   Choose your translation engine: **Chrome built-in** (Gemini Nano, no key needed — the model is downloaded once on first use), **Gemini** or **OpenAI**.
    -   For Gemini / OpenAI, paste your API Key.
    -   (Optional) Change the model or customize the system prompt.
2.  **Translate**:
    -   Paste text into the source box.
    -   Click the **Translate** button (arrow icon).
    -   Watch the translation stream in!
3.  **History**:
    -   Click the **History** (clock icon) to view past translations.
    -   Click any item to load it back into the main view.

