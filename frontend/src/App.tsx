
import { useState } from "react";
import "./App.css";

type DebugResponse = {
  error: string;
  diagnosis: string;
};

function App() {
  const [errorText, setErrorText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function analyzeError() {
    if (!errorText.trim()) {
      setMessage("Please paste your error message or code first.");
      return;
    }

    setLoading(true);
    setMessage("");
    setResult("");

    try {
      const response = await fetch("http://127.0.0.1:8000/debug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: errorText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "The backend could not analyze this error."
        );
      }

      const debugData = data as DebugResponse;
      setResult(debugData.diagnosis);
    } catch (error) {
      console.error("OpenFix AI request failed:", error);
      setMessage(
        "Could not connect to OpenFix AI. Check that the FastAPI backend and Ollama are running."
      );
    } finally {
      setLoading(false);
    }
  }

  function clearForm() {
    setErrorText("");
    setResult("");
    setMessage("");
  }

  return (
    <main className="app">
      <header className="navbar">
        <a className="brand" href="/">
          <span className="brand-icon">{"</>"}</span>
          OpenFix <span className="brand-ai">AI</span>
        </a>

        <span className="status">
          <span className="status-dot" />
          AI Debugging Assistant
        </span>
      </header>

      <section className="hero">
        <div className="eyebrow">YOUR PERSONAL AI DEBUGGER</div>

        <h1>
          Bugs happen.
          <br />
          <span>Let's fix them.</span>
        </h1>

        <p>
          Paste your error, understand the cause, and get a clear,
          beginner-friendly solution powered by AI.
        </p>
      </section>

      <section className="workspace">
        <div className="section-heading">
          <div>
            <h2>Debug your code</h2>
            <p>Paste a Python or web development error below.</p>
          </div>

          <span className="language-tag">PYTHON · WEB</span>
        </div>

        <label htmlFor="error-input">Error message or code</label>

        <textarea
          id="error-input"
          value={errorText}
          onChange={(event) => setErrorText(event.target.value)}
          placeholder={`Example:
Traceback (most recent call last):
  File "main.py", line 1
NameError: name 'pritn' is not defined`}
          rows={9}
        />

        <div className="editor-footer">
          <span>{errorText.length} characters</span>

          <button
            type="button"
            className="clear-button"
            onClick={clearForm}
          >
            Clear
          </button>
        </div>

        <button
          type="button"
          className="analyze-button"
          onClick={analyzeError}
          disabled={loading}
        >
          {loading ? "Analyzing your error..." : "✦  Analyze & Fix"}
        </button>

        {message && (
          <div className="message" role="alert">
            {message}
          </div>
        )}

        {result && (
          <section className="result-panel" aria-live="polite">
            <div className="result-heading">
              <span className="result-icon">✓</span>

              <div>
                <h2>Analysis complete</h2>
                <p>
                  Review the AI-generated explanation and suggested fix.
                </p>
              </div>
            </div>

            <pre className="result-text">{result}</pre>
          </section>
        )}
      </section>

      <footer className="footer">
        <span>OpenFix AI</span>
        <span>Understand errors. Learn to fix them.</span>
      </footer>
    </main>
  );
}

export default App;
