"use client";

import { useEffect, useState } from "react";

type ApiKeyRow = {
  id: string;
  name: string;
  key_prefix: string;
  status: "active" | "revoked" | "hidden";
  created_at: string;
  last_used_at: string | null;
};

export default function DashboardPage() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [justCreatedKey, setJustCreatedKey] = useState<string | null>(null);

  async function loadKeys() {
    setLoading(true);
    const res = await fetch("/api/keys");
    if (res.ok) {
      const data = await res.json();
      setKeys(data.keys);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadKeys();
  }, []);

  async function createKey() {
    const res = await fetch("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newKeyName || "Default Key" }),
    });
    if (res.ok) {
      const data = await res.json();
      setJustCreatedKey(data.apiKey); // shown ONCE
      setNewKeyName("");
      loadKeys();
    }
  }

  async function updateStatus(id: string, status: "active" | "revoked" | "hidden") {
    await fetch(`/api/keys/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadKeys();
  }

  async function deleteKey(id: string) {
    if (!confirm("Permanently delete this key? This cannot be undone.")) return;
    await fetch(`/api/keys/${id}`, { method: "DELETE" });
    loadKeys();
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-1">API Keys</h1>
      <p className="text-sm text-gray-500 mb-6">
        Create keys to call your gateway at <code>/api/v1/chat/completions</code>.
      </p>

      {justCreatedKey && (
        <div className="mb-6 p-4 rounded-lg border border-amber-300 bg-amber-50">
          <p className="text-sm font-medium mb-1">Copy this key now — it won't be shown again:</p>
          <code className="block break-all text-sm bg-white p-2 rounded border">{justCreatedKey}</code>
          <button
            className="mt-2 text-sm underline"
            onClick={() => navigator.clipboard.writeText(justCreatedKey)}
          >
            Copy
          </button>
        </div>
      )}

      <div className="flex gap-2 mb-8">
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="Key name (e.g. 'My App')"
          value={newKeyName}
          onChange={(e) => setNewKeyName(e.target.value)}
        />
        <button className="bg-black text-white rounded px-4 py-2" onClick={createKey}>
          Create key
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-3">
          {keys.map((k) => (
            <div key={k.id} className="border rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{k.name}</p>
                <code className="text-xs text-gray-500">{k.key_prefix}</code>
                <p className="text-xs text-gray-400 mt-1">
                  Status: <span className="font-semibold">{k.status}</span> · Created{" "}
                  {new Date(k.created_at).toLocaleDateString()}
                  {k.last_used_at && ` · Last used ${new Date(k.last_used_at).toLocaleString()}`}
                </p>
              </div>
              <div className="flex gap-2 text-sm">
                {k.status !== "active" && (
                  <button className="underline" onClick={() => updateStatus(k.id, "active")}>
                    Activate
                  </button>
                )}
                {k.status !== "hidden" && (
                  <button className="underline" onClick={() => updateStatus(k.id, "hidden")}>
                    Hide
                  </button>
                )}
                {k.status !== "revoked" && (
                  <button className="underline text-red-600" onClick={() => updateStatus(k.id, "revoked")}>
                    Revoke
                  </button>
                )}
                <button className="underline text-red-600" onClick={() => deleteKey(k.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          {keys.length === 0 && <p className="text-sm text-gray-500">No API keys yet.</p>}
        </div>
      )}
    </div>
  );
}
