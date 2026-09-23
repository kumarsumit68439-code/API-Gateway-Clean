export default function DocsPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 prose">
      <h1>API Documentation</h1>

      <h2>Authentication</h2>
      <p>
        Create a key from your <a href="/dashboard">Dashboard</a>, then send it as a Bearer token:
      </p>
      <pre>{`Authorization: Bearer sk-gw-xxxxxxxxxxxxxxxxxxxxxxxx`}</pre>

      <h2>Endpoint: Chat Completions</h2>
      <pre>{`POST /api/v1/chat/completions`}</pre>
      <p>Request body (OpenAI-compatible shape):</p>
      <pre>{`{
  "model": "llama-3.3-70b-versatile",
  "messages": [
    { "role": "user", "content": "Hello!" }
  ],
  "temperature": 0.7,
  "max_tokens": 1024
}`}</pre>
      <p>Example with curl:</p>
      <pre>{`curl -X POST https://YOUR-DOMAIN.vercel.app/api/v1/chat/completions \\
  -H "Authorization: Bearer sk-gw-xxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "llama-3.3-70b-versatile",
    "messages": [{"role":"user","content":"Hello!"}]
  }'`}</pre>

      <h2>Endpoint: List Models</h2>
      <pre>{`GET /api/v1/models`}</pre>
      <p>Returns every model your gateway currently supports across Groq and OpenRouter's free tier.</p>

      <h2>How it works</h2>
      <ol>
        <li>Client sends a request to your gateway with YOUR platform API key.</li>
        <li>Your server verifies the key against Supabase (active / revoked / hidden).</li>
        <li>
          Your server calls Groq or OpenRouter using YOUR secret provider keys (stored only in Vercel
          environment variables — never exposed to clients).
        </li>
        <li>The response is returned to the client, and usage is logged for that key.</li>
      </ol>

      <h2>Key states</h2>
      <ul>
        <li><strong>active</strong> — works normally</li>
        <li><strong>hidden</strong> — key is deprioritized in your dashboard view but still blocked from use (treated as inactive)</li>
        <li><strong>revoked</strong> — permanently blocked; requests return 401</li>
      </ul>

      <h2>Errors</h2>
      <table>
        <thead>
          <tr><th>Status</th><th>Meaning</th></tr>
        </thead>
        <tbody>
          <tr><td>401</td><td>Missing, invalid, revoked, or hidden API key</td></tr>
          <tr><td>400</td><td>Unknown model or malformed request body</td></tr>
          <tr><td>502</td><td>Upstream provider (Groq/OpenRouter) request failed</td></tr>
        </tbody>
      </table>
    </div>
  );
}
