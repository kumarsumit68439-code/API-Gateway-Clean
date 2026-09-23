"use client";

import { useEffect, useState } from "react";

type ModelInfo = { id: string; provider: string; name: string };

export default function PlaygroundPage() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [model, setModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [prompt, setPrompt] = useState("Hello! Introduce yourself in one sentence.");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/v1/models")
      .then((r) => r.json())
      .then((d) => {
        setModels(d.data);
        if (d.data[0]) setModel(d.data[0].id);
      });
  }, []);

  async function runPrompt() {
    setLoading(true);
    setResponse("");
    try {
      const res = await fetch("/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResponse(`Error: ${data.error || JSON.stringify(data)}`);
      } else {
        setResponse(data.choices?.[0]?.message?.content ?? JSON.stringify(data, null, 2));
      }
    } catch (err: any) {
      setResponse(`Request failed: ${err.message}`);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Playground</h1>

      <div>
        <label className="text-sm font-medium">Your API key</label>
        <input
          className="border rounded w-full px-3 py-2 mt-1"
          placeholder="sk-gw-..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Model</label>
        <select
          className="border rounded w-full px-3 py-2 mt-1"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.provider})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">Prompt</label>
        <textarea
          className="border rounded w-full px-3 py-2 mt-1 h-28"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      <button
        className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
        disabled={loading || !apiKey}
        onClick={runPrompt}
      >
        {loading ? "Running..." : "Run"}
      </button>

      {response && (
        <div className="border rounded p-4 bg-gray-50 whitespace-pre-wrap text-sm">{response}</div>
      )}
    </div>
  );
}
