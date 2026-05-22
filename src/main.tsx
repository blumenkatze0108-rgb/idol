import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Shim fetch for direct client-side compatibility of single index.html
try {
  const originalFetch = window.fetch;
  const customFetch = async function (input: any, init?: any): Promise<Response> {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : "";
    if (url === "/api/gemini/generate" || url.endsWith("/api/gemini/generate")) {
      try {
        const body = init && init.body ? JSON.parse(init.body as string) : {};
        const { smartCallGemini } = await import("./components/apiHelper");
        const result = await smartCallGemini(body);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch (e) {
        console.error("fetch shim error, fallback to original fetch:", e);
      }
    }
    
    if (url === "/api/gemini/models" || url.endsWith("/api/gemini/models")) {
      try {
        return new Response(JSON.stringify({
          models: [
            { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash (推荐)" },
            { id: "gemini-2.1-flash", name: "Gemini 2.1 Flash (速度快)" },
            { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro (逻辑强)" }
          ]
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch (e) {
        // Ignore
      }
    }

    return originalFetch.call(window, input, init);
  };

  Object.defineProperty(window, 'fetch', {
    value: customFetch,
    writable: true,
    configurable: true
  });
} catch (error) {
  console.warn("Could not patch window.fetch directly due to environment restrictions. Falling back to globalThis.fetch patching.", error);
  try {
    const originalFetch = globalThis.fetch;
    const customFetch = async function (input: any, init?: any): Promise<Response> {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : "";
      if (url === "/api/gemini/generate" || url.endsWith("/api/gemini/generate")) {
        const body = init && init.body ? JSON.parse(init.body as string) : {};
        const { smartCallGemini } = await import("./components/apiHelper");
        const result = await smartCallGemini(body);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      return originalFetch.call(globalThis, input, init);
    };
    Object.defineProperty(globalThis, 'fetch', {
      value: customFetch,
      writable: true,
      configurable: true
    });
  } catch (error2) {
    console.error("Failed to shim globalThis.fetch:", error2);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
