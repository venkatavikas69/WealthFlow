import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {AuthProvider} from './contexts/AuthContext.tsx';
import {ThemeProvider} from './contexts/ThemeContext.tsx';
import './index.css';

// Global error handler for debugging on static deployments
window.onerror = (message, source, lineno, colno, error) => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif; color: #721c24; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; margin: 20px;">
        <h1 style="margin-top: 0;">Application Error</h1>
        <p>The application failed to load. This might be due to missing configuration or a runtime error.</p>
        <pre style="background: white; padding: 10px; overflow: auto; border: 1px solid #ddd;">${message}\nat ${source}:${lineno}:${colno}</pre>
        <button onclick="location.reload()" style="padding: 8px 16px; background: #721c24; color: white; border: none; border-radius: 4px; cursor: pointer;">Reload Application</button>
      </div>
    `;
  }
  return false;
};

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Could not find root element with id 'root'");
  }

  createRoot(rootElement).render(
    <StrictMode>
      <AuthProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </AuthProvider>
    </StrictMode>,
  );
} catch (error: any) {
  console.error("Startup error:", error);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding: 20px; color: red;">Startup Error: ${error.message}</div>`;
  }
}
